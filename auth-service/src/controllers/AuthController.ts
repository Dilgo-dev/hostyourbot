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

      const { user, token, requires2FA, tempToken } = await this.authService.login(email, password);

      const userResponse = { ...user };
      delete (userResponse as any).password;

      if (requires2FA && tempToken) {
        await logInfo('Connexion réussie - 2FA requis', { userId: user.id, email: user.email });
        res.status(200).json({
          message: 'Two-factor authentication required',
          requires2FA: true,
          tempToken,
          user: userResponse,
        });
        return;
      }

      res.cookie('token', token!, {
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

  private generateHtmlExport(userData: any): string {
    const formatDate = (date: Date) => new Date(date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mes données - HostYourBot</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #ffffff;
      color: #000000;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #111827;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .section {
      margin-bottom: 32px;
    }
    .section h2 {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    .field {
      margin-bottom: 12px;
      display: flex;
      align-items: baseline;
    }
    .field-label {
      color: #6b7280;
      font-size: 14px;
      min-width: 200px;
      font-weight: 500;
    }
    .field-value {
      color: #111827;
      font-size: 14px;
      word-break: break-all;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HostYourBot</h1>
      <p>Export de vos données personnelles</p>
    </div>

    <div class="section">
      <h2>Profil</h2>
      <div class="field">
        <div class="field-label">Identifiant :</div>
        <div class="field-value">${userData.id}</div>
      </div>
      <div class="field">
        <div class="field-label">Email :</div>
        <div class="field-value">${userData.email || 'Non renseigné'}</div>
      </div>
    </div>

    <div class="section">
      <h2>Discord</h2>
      <div class="field">
        <div class="field-label">Discord ID :</div>
        <div class="field-value">${userData.discordId || 'Non connecté'}</div>
      </div>
      <div class="field">
        <div class="field-label">Nom d'utilisateur Discord :</div>
        <div class="field-value">${userData.discordUsername || 'Non connecté'}</div>
      </div>
      ${userData.discordAvatar ? `
      <div class="field">
        <div class="field-label">Avatar Discord :</div>
        <div class="field-value">${userData.discordAvatar}</div>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <h2>Sécurité</h2>
      <div class="field">
        <div class="field-label">Double authentification (2FA) :</div>
        <div class="field-value">${userData.twoFactorEnabled ? 'Activée' : 'Désactivée'}</div>
      </div>
    </div>

    <div class="section">
      <h2>Dates</h2>
      <div class="field">
        <div class="field-label">Compte créé le :</div>
        <div class="field-value">${formatDate(userData.createdAt)}</div>
      </div>
      <div class="field">
        <div class="field-label">Dernière modification :</div>
        <div class="field-value">${formatDate(userData.updatedAt)}</div>
      </div>
    </div>

    <div class="footer">
      Document généré le ${formatDate(new Date())}
    </div>
  </div>
</body>
</html>`;
  }

  exportUserData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;
      const format = req.query.format as string || 'json';

      const user = await this.authService.getUserById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const userData = {
        id: user.id,
        email: user.email,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        discordAvatar: user.discordAvatar,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      await logInfo('Export des données utilisateur', { userId, format });

      const date = new Date().toISOString().split('T')[0];

      if (format === 'html') {
        const htmlContent = this.generateHtmlExport(userData);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="mes-donnees-${date}.html"`);
        res.status(200).send(htmlContent);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="mes-donnees-${date}.json"`);
        res.status(200).json(userData);
      }
    } catch (error) {
      await logError('Échec de l\'export des données', { error: (error as Error).message });
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
