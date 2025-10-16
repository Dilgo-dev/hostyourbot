import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { logWarn } from '../utils/logger';

const subscriptionService = new SubscriptionService();

export const checkCanCreateBot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const canCreate = await subscriptionService.canUserCreateBot(userId);

    if (!canCreate) {
      await logWarn('Tentative de création de bot avec limite atteinte', { userId });
      res.status(403).json({
        error: 'Bot creation limit reached',
        message: 'You have reached the maximum number of bots allowed by your subscription plan. Please upgrade your plan to create more bots.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const checkCanScaleBot = (requestedReplicas: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const replicas = req.body.replicas || requestedReplicas;

      const canScale = await subscriptionService.canUserScaleBot(userId, replicas);

      if (!canScale) {
        await logWarn('Tentative de scaling au-delà de la limite', { userId, replicas });
        res.status(403).json({
          error: 'Scaling limit exceeded',
          message: 'The requested number of replicas exceeds your subscription plan limit. Please upgrade your plan for higher scaling capabilities.',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
};
