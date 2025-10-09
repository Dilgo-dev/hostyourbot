import passport from 'passport';
import { Strategy as DiscordStrategy, Profile } from 'passport-discord';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
      callbackURL: process.env.DISCORD_CALLBACK_URL || '',
      scope: ['identify', 'email'],
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: any) => {
      try {
        const user = await authService.findOrCreateDiscordUser(profile);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await authService.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
