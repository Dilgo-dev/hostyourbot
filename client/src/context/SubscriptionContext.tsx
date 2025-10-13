import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSubscription, SubscriptionLimits } from '../types/subscription';
import { getUserSubscription, getResourceLimits } from '../services/subscriptionService';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  limits: SubscriptionLimits | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [subscriptionData, limitsData] = await Promise.all([
        getUserSubscription(),
        getResourceLimits(),
      ]);

      setSubscription(subscriptionData);
      setLimits(limitsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscription data');
      console.error('Error fetching subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const refreshSubscription = async () => {
    await fetchSubscriptionData();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        limits,
        loading,
        error,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
