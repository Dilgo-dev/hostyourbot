import passport from 'passport';
import { Strategy as DiscordStrategy, Profile } from 'passport-discord';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

const discordClientId = process.env.DISCORD_CLIENT_ID;
const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
const discordCallbackUrl = process.env.DISCORD_CALLBACK_URL;

if (discordClientId && discordClientSecret && discordCallbackUrl) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: discordClientId,
        clientSecret: discordClientSecret,
        callbackURL: discordCallbackUrl,
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
} else {
  console.warn('[Passport] Discord OAuth configuration missing, strategy not initialized');
}

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
