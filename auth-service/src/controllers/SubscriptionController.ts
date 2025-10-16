import { Request, Response } from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { logInfo, logError } from '../utils/logger';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  getAvailablePlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const plans = await this.subscriptionService.getAvailablePlans();

      res.status(200).json({
        plans: plans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          displayName: plan.displayName,
          description: plan.description,
          price: plan.price,
          billingPeriod: plan.billingPeriod,
          features: plan.features,
        })),
      });
    } catch (error) {
      await logError('Échec de la récupération des plans', {
        error: (error as Error).message,
      });
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getUserSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;

      const subscription = await this.subscriptionService.getUserSubscription(userId);

      await logInfo('Récupération de l\'abonnement utilisateur', { userId });

      res.status(200).json({ subscription });
    } catch (error) {
      await logError('Échec de la récupération de l\'abonnement', {
        error: (error as Error).message,
      });
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getResourceLimits = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;

      const limits = await this.subscriptionService.getResourceLimits(userId);

      res.status(200).json({ limits });
    } catch (error) {
      await logError('Échec de la récupération des limites', {
        error: (error as Error).message,
      });
      res.status(500).json({ error: (error as Error).message });
    }
  };

  checkCanCreateBot = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).userId;

      const canCreate = await this.subscriptionService.canUserCreateBot(userId);

      res.status(200).json({ canCreate });
    } catch (error) {
      await logError('Échec de la vérification de création de bot', {
        error: (error as Error).message,
      });
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
