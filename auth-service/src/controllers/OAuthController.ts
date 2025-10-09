import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from '../config/passport';

export class OAuthController {
  discordAuth = passport.authenticate('discord');

  discordCallback = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('discord', (err: any, user: any, info: any) => {
      if (err) {
        console.error('[OAuthController] Discord authentication error:', err);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/login?error=authentication_failed`);
      }

      if (!user) {
        console.error('[OAuthController] No user returned from Discord');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/login?error=no_user`);
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d',
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/oauth/callback?token=${token}`);
    })(req, res, next);
  };
}
