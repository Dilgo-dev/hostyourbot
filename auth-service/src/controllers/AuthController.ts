import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { validate } from 'class-validator';
import { User } from '../entities/User';
import { logInfo, logError, logWarn } from '../utils/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        await logWarn('Tentative d\'inscription avec des champs manquants', { email: email || 'non fourni' });
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const { user, token } = await this.authService.register(email, password);

      const userResponse = { ...user };
      delete (userResponse as any).password;

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      await logInfo('Utilisateur inscrit avec succès', { userId: user.id, email: user.email });

      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse,
      });
    } catch (error) {
      await logError('Échec de l\'inscription', { error: (error as Error).message });
      res.status(400).json({ error: (error as Error).message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        await logWarn('Tentative de connexion avec des champs manquants', { email: email || 'non fourni' });
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const { user, token } = await this.authService.login(email, password);

      const userResponse = { ...user };
      delete (userResponse as any).password;

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      await logInfo('Connexion réussie', { userId: user.id, email: user.email });

      res.status(200).json({
        message: 'Login successful',
        user: userResponse,
      });
    } catch (error) {
      await logError('Échec de connexion', { error: (error as Error).message });
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
    const userId = (req as any).userId;

    res.clearCookie('token', { path: '/' });

    await logInfo('Déconnexion réussie', { userId: userId || 'inconnu' });

    res.status(200).json({ message: 'Logout successful' });
  };

  updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters long' });
        return;
      }

      await this.authService.updatePassword(userId, oldPassword, newPassword);

      await logInfo('Mot de passe mis à jour', { userId });

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      await logError('Échec de la mise à jour du mot de passe', { error: (error as Error).message });
      res.status(400).json({ error: (error as Error).message });
    }
  };

  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;

      await this.authService.deleteAccount(userId);

      res.clearCookie('token', { path: '/' });

      await logInfo('Compte supprimé', { userId });

      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      await logError('Échec de la suppression du compte', { error: (error as Error).message });
      res.status(500).json({ error: (error as Error).message });
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      await this.authService.requestPasswordReset(email);

      await logInfo('Demande de réinitialisation de mot de passe', { email });

      res.status(200).json({ message: 'Password reset email sent if account exists' });
    } catch (error) {
      await logError('Échec de la demande de réinitialisation', { error: (error as Error).message });
      res.status(500).json({ error: 'An error occurred' });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({ error: 'Token and new password are required' });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters long' });
        return;
      }

      await this.authService.resetPassword(token, newPassword);

      await logInfo('Mot de passe réinitialisé avec succès');

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      await logError('Échec de la réinitialisation du mot de passe', { error: (error as Error).message });
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
