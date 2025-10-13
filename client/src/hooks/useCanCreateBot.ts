import { useSubscription } from '../context/SubscriptionContext';

export const useCanCreateBot = () => {
  const { limits, loading } = useSubscription();

  const canCreate = limits?.canCreateBot ?? false;
  const currentBots = limits?.currentBots ?? 0;
  const maxBots = limits?.maxBots ?? 0;

  return {
    canCreate,
    currentBots,
    maxBots,
    loading,
    message: canCreate
      ? `Vous pouvez créer encore ${maxBots - currentBots} bot(s)`
      : `Limite atteinte (${currentBots}/${maxBots}). Améliorez votre plan pour créer plus de bots.`,
  };
};
