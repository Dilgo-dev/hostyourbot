import { authApi } from './api';
import type { SubscriptionPlan, UserSubscription, SubscriptionLimits } from '../types/subscription';

export const getAvailablePlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await authApi.get('/api/subscription/plans');
  return response.data.plans;
};

export const getUserSubscription = async (): Promise<UserSubscription> => {
  const response = await authApi.get('/api/subscription/me');
  return response.data.subscription;
};

export const getResourceLimits = async (): Promise<SubscriptionLimits> => {
  const response = await authApi.get('/api/subscription/limits');
  return response.data.limits;
};

export const canCreateBot = async (): Promise<boolean> => {
  const response = await authApi.get('/api/subscription/can-create-bot');
  return response.data.canCreate;
};
