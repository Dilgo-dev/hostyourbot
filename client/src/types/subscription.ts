export enum PlanName {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export interface PlanFeatures {
  maxBots: number;
  maxReplicas: number;
  maxCpuPerBot: string;
  maxMemoryPerBot: string;
  prioritySupport: boolean;
  customDomain: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: PlanName;
  displayName: string;
  description: string;
  price: number;
  billingPeriod: string;
  features: PlanFeatures;
}

export interface UserSubscription {
  plan: PlanName;
  status: string;
  startDate: string;
  endDate: string | null;
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
