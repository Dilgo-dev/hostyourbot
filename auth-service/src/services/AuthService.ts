import { Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { sendWelcomeEmail } from '../grpc/mailGrpcClient';

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

      sendWelcomeEmail({
        to: savedUser.email,
        user_name: savedUser.email.split('@')[0],
      }).catch((error) => {
        console.error('[AuthService] Erreur envoi email bienvenue:', error);
      });

      return { user: savedUser, token };
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      console.error('[AuthService] Error stack:', (error as Error).stack);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
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
}
