import { Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(email: string, password: string): Promise<{ user: User; token: string }> {
    console.log('[AuthService] Starting registration for:', email);

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      console.log('[AuthService] User already exists:', email);
      throw new Error('User already exists');
    }

    console.log('[AuthService] Creating user entity');
    const user = this.userRepository.create({
      email,
      password,
    });

    console.log('[AuthService] Saving user to database (bcrypt hashing will occur)');
    const savedUser = await this.userRepository.save(user);
    console.log('[AuthService] User saved successfully, ID:', savedUser.id);

    console.log('[AuthService] Generating JWT token');
    const token = this.generateToken(savedUser.id);
    console.log('[AuthService] Registration completed successfully');

    return { user: savedUser, token };
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
}
