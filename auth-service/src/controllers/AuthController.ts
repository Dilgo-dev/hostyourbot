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
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 40px 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #1e293b;
      border-radius: 16px;
      border: 1px solid #9333ea;
      box-shadow: 0 20px 50px rgba(147, 51, 234, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .header p {
      color: #e9d5ff;
      font-size: 14px;
    }
    .content {
      padding: 40px;
    }
    .section {
      margin-bottom: 32px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 24px;
    }
    .section h2 {
      color: #a78bfa;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section h2::before {
      content: "▸";
      color: #9333ea;
      font-size: 24px;
    }
    .field {
      margin-bottom: 16px;
      padding: 12px;
      background: #1e293b;
      border-radius: 8px;
      border-left: 3px solid #9333ea;
    }
    .field:last-child {
      margin-bottom: 0;
    }
    .field-label {
      color: #94a3b8;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .field-value {
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
      word-break: break-all;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
    }
    .badge-success {
      background: #065f46;
      color: #6ee7b7;
    }
    .badge-danger {
      background: #7f1d1d;
      color: #fca5a5;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #64748b;
      font-size: 14px;
      border-top: 1px solid #334155;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>HostYourBot</h1>
      <p>Export de vos données personnelles</p>
    </div>
    <div class="content">
      <div class="section">
        <h2>Profil</h2>
        <div class="field">
          <div class="field-label">Identifiant</div>
          <div class="field-value">${userData.id}</div>
        </div>
        <div class="field">
          <div class="field-label">Email</div>
          <div class="field-value">${userData.email || 'Non renseigné'}</div>
        </div>
      </div>

      <div class="section">
        <h2>Discord</h2>
        <div class="field">
          <div class="field-label">Discord ID</div>
          <div class="field-value">${userData.discordId || 'Non connecté'}</div>
        </div>
        <div class="field">
          <div class="field-label">Nom d'utilisateur Discord</div>
          <div class="field-value">${userData.discordUsername || 'Non connecté'}</div>
        </div>
        ${userData.discordAvatar ? `
        <div class="field">
          <div class="field-label">Avatar Discord</div>
          <div class="field-value">${userData.discordAvatar}</div>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <h2>Sécurité</h2>
        <div class="field">
          <div class="field-label">Double authentification (2FA)</div>
          <div class="field-value">
            <span class="badge ${userData.twoFactorEnabled ? 'badge-success' : 'badge-danger'}">
              ${userData.twoFactorEnabled ? 'Activée' : 'Désactivée'}
            </span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Dates</h2>
        <div class="field">
          <div class="field-label">Compte créé le</div>
          <div class="field-value">${formatDate(userData.createdAt)}</div>
        </div>
        <div class="field">
          <div class="field-label">Dernière modification</div>
          <div class="field-value">${formatDate(userData.updatedAt)}</div>
        </div>
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
