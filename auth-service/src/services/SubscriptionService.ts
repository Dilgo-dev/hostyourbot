import { Repository } from 'typeorm';
import axios from 'axios';
import { User } from '../entities/User';
import { SubscriptionPlan, PlanName, PlanFeatures } from '../entities/SubscriptionPlan';
import { AppDataSource } from '../config/database';

export interface UserSubscription {
  plan: PlanName;
  status: string;
  startDate: Date;
  endDate: Date | null;
  features: PlanFeatures;
}

export interface SubscriptionLimits {
  maxBots: number;
  maxReplicas: number;
  maxCpuPerBot: string;
  maxMemoryPerBot: string;
  currentBots: number;
  canCreateBot: boolean;
}

export class SubscriptionService {
  private userRepository: Repository<User>;
  private subscriptionPlanRepository: Repository<SubscriptionPlan>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.subscriptionPlanRepository = AppDataSource.getRepository(SubscriptionPlan);
  }

  async getUserSubscription(userId: string): Promise<UserSubscription> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = await this.subscriptionPlanRepository.findOne({
      where: { name: user.subscriptionPlan },
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    return {
      plan: user.subscriptionPlan,
      status: user.subscriptionStatus,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      features: plan.features,
    };
  }

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    return await this.subscriptionPlanRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  async getPlanByName(planName: PlanName): Promise<SubscriptionPlan | null> {
    return await this.subscriptionPlanRepository.findOne({
      where: { name: planName },
    });
  }

  async getCurrentBotCount(userId: string): Promise<number> {
    try {
      const k8sServiceUrl = process.env.K8S_SERVICE_URL || 'http://k8s-service:3003';
      const response = await axios.get(`${k8sServiceUrl}/api/v1/bots`, {
        params: { userId },
      });

      return response.data.length || 0;
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de bots:', error);
      return 0;
    }
  }

  async canUserCreateBot(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = await this.subscriptionPlanRepository.findOne({
      where: { name: user.subscriptionPlan },
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    const currentBotCount = await this.getCurrentBotCount(userId);

    return currentBotCount < plan.features.maxBots;
  }

  async canUserScaleBot(userId: string, replicas: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = await this.subscriptionPlanRepository.findOne({
      where: { name: user.subscriptionPlan },
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    return replicas <= plan.features.maxReplicas;
  }

  async getResourceLimits(userId: string): Promise<SubscriptionLimits> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = await this.subscriptionPlanRepository.findOne({
      where: { name: user.subscriptionPlan },
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    const currentBots = await this.getCurrentBotCount(userId);
    const canCreateBot = currentBots < plan.features.maxBots;

    return {
      maxBots: plan.features.maxBots,
      maxReplicas: plan.features.maxReplicas,
      maxCpuPerBot: plan.features.maxCpuPerBot,
      maxMemoryPerBot: plan.features.maxMemoryPerBot,
      currentBots,
      canCreateBot,
    };
  }

  async updateUserPlan(
    userId: string,
    newPlan: PlanName,
    endDate?: Date
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = await this.subscriptionPlanRepository.findOne({
      where: { name: newPlan },
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    user.subscriptionPlan = newPlan;
    user.subscriptionStartDate = new Date();
    user.subscriptionEndDate = endDate || null;

    return await this.userRepository.save(user);
  }
}
