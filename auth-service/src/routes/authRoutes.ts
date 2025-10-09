import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { TwoFactorController } from '../controllers/TwoFactorController';
import { OAuthController } from '../controllers/OAuthController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const authController = new AuthController();
const twoFactorController = new TwoFactorController();
const oauthController = new OAuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);
router.put('/account/password', authMiddleware, authController.updatePassword);
router.delete('/account', authMiddleware, authController.deleteAccount);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/2fa/generate', authMiddleware, twoFactorController.generateSecret);
router.post('/2fa/enable', authMiddleware, twoFactorController.enable);
router.post('/2fa/disable', authMiddleware, twoFactorController.disable);
router.post('/2fa/verify', twoFactorController.verify);

router.get('/discord', oauthController.discordAuth);
router.get('/discord/callback', oauthController.discordCallback);

export default router;
