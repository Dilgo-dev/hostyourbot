import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { validate } from 'class-validator';
import { User } from '../entities/User';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const { user, token } = await this.authService.register(email, password);

      const userResponse = { ...user };
      delete (userResponse as any).password;

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse,
        token,
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const { user, token } = await this.authService.login(email, password);

      const userResponse = { ...user };
      delete (userResponse as any).password;

      res.status(200).json({
        message: 'Login successful',
        user: userResponse,
        token,
      });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;

      const user = await this.authService.getUserById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userResponse = { ...user };
      delete (userResponse as any).password;

      res.status(200).json({ user: userResponse });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({ message: 'Logout successful' });
  };
}
