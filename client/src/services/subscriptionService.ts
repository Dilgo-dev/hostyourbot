import api from './api';
import { SubscriptionPlan, UserSubscription, SubscriptionLimits } from '../types/subscription';

export const getAvailablePlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await api.get('/subscription/plans');
  return response.data.plans;
};

export const getUserSubscription = async (): Promise<UserSubscription> => {
  const response = await api.get('/subscription/me');
  return response.data.subscription;
};

export const getResourceLimits = async (): Promise<SubscriptionLimits> => {
  const response = await api.get('/subscription/limits');
  return response.data.limits;
};

export const canCreateBot = async (): Promise<boolean> => {
  const response = await api.get('/subscription/can-create-bot');
  return response.data.canCreate;
};
