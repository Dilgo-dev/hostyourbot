import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { logInfo, logError } from '../utils/logger';

export class TwoFactorController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  generateSecret = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;

      const { secret, qrCodeUrl } = await this.authService.generateTwoFactorSecret(userId);

      await logInfo('Secret 2FA généré', { userId });

      res.status(200).json({
        message: 'Two-factor secret generated successfully',
        secret,
        qrCodeUrl,
      });
    } catch (error) {
      await logError('Échec de la génération du secret 2FA', { error: (error as Error).message });
      res.status(500).json({ error: (error as Error).message });
    }
  };

  enable = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'Verification code is required' });
        return;
      }

      await this.authService.enableTwoFactor(userId, token);

      await logInfo('2FA activé', { userId });

      res.status(200).json({ message: 'Two-factor authentication enabled successfully' });
    } catch (error) {
      await logError('Échec de l\'activation de la 2FA', { error: (error as Error).message });
      res.status(400).json({ error: (error as Error).message });
    }
  };

  disable = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ error: 'Password is required' });
        return;
      }

      await this.authService.disableTwoFactor(userId, password);

      await logInfo('2FA désactivé', { userId });

      res.status(200).json({ message: 'Two-factor authentication disabled successfully' });
    } catch (error) {
      await logError('Échec de la désactivation de la 2FA', { error: (error as Error).message });
      res.status(400).json({ error: (error as Error).message });
    }
  };

  verify = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tempToken, code } = req.body;

      if (!tempToken || !code) {
        res.status(400).json({ error: 'Temporary token and verification code are required' });
        return;
      }

      const { user, token } = await this.authService.verifyTwoFactorCode(tempToken, code);

      const userResponse = { ...user };
      delete (userResponse as any).password;

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      await logInfo('Vérification 2FA réussie', { userId: user.id });

      res.status(200).json({
        message: 'Two-factor verification successful',
        user: userResponse,
      });
    } catch (error) {
      await logError('Échec de la vérification 2FA', { error: (error as Error).message });
      res.status(401).json({ error: (error as Error).message });
    }
  };
}
