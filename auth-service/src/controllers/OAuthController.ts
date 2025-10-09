import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport';
import { logInfo, logError } from '../utils/logger';

export class OAuthController {
  discordAuth = passport.authenticate('discord');

  discordCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('discord', async (err: any, user: any, info: any) => {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      if (err) {
        console.error('[OAuthController] Discord authentication error:', err);
        await logError('Échec de l\'authentification Discord', { error: err.message });
        return res.redirect(`${frontendUrl}/login?error=authentication_failed`);
      }

      if (!user) {
        console.error('[OAuthController] No user returned from Discord');
        await logError('Aucun utilisateur retourné par Discord', {});
        return res.redirect(`${frontendUrl}/login?error=no_user`);
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d',
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      await logInfo('Connexion Discord réussie', {
        userId: user.id,
        discordUsername: user.discordUsername
      });

      res.redirect(frontendUrl);
    })(req, res, next);
  };
}
