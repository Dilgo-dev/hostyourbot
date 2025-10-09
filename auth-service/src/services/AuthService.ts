import { Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import axios from 'axios';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../grpc/mailGrpcClient';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      console.log('[AuthService] Starting registration for:', email);

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        console.log('[AuthService] User already exists:', email);
        throw new Error('User already exists');
      }

      console.log('[AuthService] Hashing password with bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('[AuthService] Password hashed successfully');

      console.log('[AuthService] Creating user entity');
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
      });

      console.log('[AuthService] Saving user to database');
      const savedUser = await this.userRepository.save(user);
      console.log('[AuthService] User saved successfully, ID:', savedUser.id);

      console.log('[AuthService] Generating JWT token');
      const token = this.generateToken(savedUser.id);
      console.log('[AuthService] Registration completed successfully');

      if (savedUser.email) {
        sendWelcomeEmail({
          to: savedUser.email,
          user_name: savedUser.email.split('@')[0],
        }).catch((error) => {
          console.error('[AuthService] Erreur envoi email bienvenue:', error);
        });
      }

      return { user: savedUser, token };
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      console.error('[AuthService] Error stack:', (error as Error).stack);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: User; token?: string; requires2FA?: boolean; tempToken?: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign({ userId: user.id, temp2FA: true }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '10m',
      });
      return { user, requires2FA: true, tempToken };
    }

    const token = this.generateToken(user.id);

    return { user, token };
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });
  }

  verifyToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await user.validatePassword(oldPassword);

    if (!isValidPassword) {
      throw new Error('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);
  }

  async deleteAccount(userId: string): Promise<void> {
    const k8sServiceUrl = process.env.K8S_SERVICE_URL || 'http://k8s-service:3003';

    try {
      await axios.delete(`${k8sServiceUrl}/api/v1/bots/user/${userId}`);
    } catch (error: any) {
      console.error('Erreur lors de la suppression des bots:', error.message);
      if (error.response?.status !== 404) {
        throw new Error('Failed to delete user bots');
      }
    }

    await this.userRepository.delete({ id: userId });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;

    await this.userRepository.save(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    sendPasswordResetEmail({
      to: user.email,
      reset_link: resetLink,
      user_name: user.email.split('@')[0],
    }).catch((error) => {
      console.error('[AuthService] Erreur envoi email réinitialisation:', error);
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
      },
    });

    if (!user || !user.resetPasswordExpires) {
      throw new Error('Invalid or expired reset token');
    }

    if (user.resetPasswordExpires < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);
  }

  async generateTwoFactorSecret(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `HostYourBot (${user.email})`,
      issuer: 'HostYourBot',
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    user.twoFactorSecret = secret.base32;
    await this.userRepository.save(user);

    return {
      secret: secret.base32,
      qrCodeUrl,
    };
  }

  async enableTwoFactor(userId: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      throw new Error('Two-factor secret not generated');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new Error('Invalid verification code');
    }

    user.twoFactorEnabled = true;
    await this.userRepository.save(user);
  }

  async disableTwoFactor(userId: string, password: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await this.userRepository.save(user);
  }

  async verifyTwoFactorCode(tempToken: string, code: string): Promise<{ user: User; token: string }> {
    let decoded: any;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret');
    } catch (error) {
      throw new Error('Invalid or expired token');
    }

    if (!decoded.temp2FA) {
      throw new Error('Invalid token type');
    }

    const user = await this.userRepository.findOne({ where: { id: decoded.userId } });

    if (!user || !user.twoFactorSecret) {
      throw new Error('User not found or 2FA not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      throw new Error('Invalid verification code');
    }

    const token = this.generateToken(user.id);

    return { user, token };
  }

  async findOrCreateDiscordUser(profile: any): Promise<User> {
    const discordId = profile.id;
    const discordUsername = profile.username;
    const discordAvatar = profile.avatar;
    const email = profile.email;

    let user = await this.userRepository.findOne({
      where: { discordId },
    });

    if (user) {
      user.discordUsername = discordUsername;
      user.discordAvatar = discordAvatar;
      if (email && !user.email) {
        user.email = email;
      }
      await this.userRepository.save(user);
      return user;
    }

    if (email) {
      user = await this.userRepository.findOne({
        where: { email },
      });

      if (user) {
        user.discordId = discordId;
        user.discordUsername = discordUsername;
        user.discordAvatar = discordAvatar;
        await this.userRepository.save(user);
        return user;
      }
    }

    user = this.userRepository.create({
      discordId,
      discordUsername,
      discordAvatar,
      email,
    });

    const savedUser = await this.userRepository.save(user);

    if (savedUser.email) {
      sendWelcomeEmail({
        to: savedUser.email,
        user_name: savedUser.discordUsername || savedUser.email.split('@')[0],
      }).catch((error) => {
        console.error('[AuthService] Erreur envoi email bienvenue:', error);
      });
    }

    return savedUser;
  }
}
