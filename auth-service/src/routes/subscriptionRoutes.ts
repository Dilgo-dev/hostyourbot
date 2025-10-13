import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const subscriptionController = new SubscriptionController();

router.get('/plans', subscriptionController.getAvailablePlans);

router.get('/me', authMiddleware, subscriptionController.getUserSubscription);

router.get('/limits', authMiddleware, subscriptionController.getResourceLimits);

router.get('/can-create-bot', authMiddleware, subscriptionController.checkCanCreateBot);

export default router;
