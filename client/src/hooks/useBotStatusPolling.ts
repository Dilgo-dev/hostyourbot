import { useState, useEffect, useRef } from 'react';
import { botService } from '../services/botService';
import type { UpdateStage } from '../component/botdetail/UpdateProgressScreen';

interface BotStatusPollingOptions {
  botId: string;
  enabled: boolean;
  onStageChange?: (stage: UpdateStage) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  pollInterval?: number;
}

export function useBotStatusPolling({
  botId,
  enabled,
  onStageChange,
  onComplete,
  onError,
  pollInterval = 1000,
}: BotStatusPollingOptions) {
  const [stage, setStage] = useState<UpdateStage>('validation');
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStageRef = useRef<UpdateStage>('validation');

  console.log('[useBotStatusPolling] Hook appelé - enabled:', enabled, 'botId:', botId);

  useEffect(() => {
    console.log('[useBotStatusPolling.useEffect] Effect exécuté - enabled:', enabled, 'botId:', botId);

    if (!enabled) {
      console.log('[useBotStatusPolling.useEffect] Polling désactivé, nettoyage de l\'interval');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const pollStatus = async () => {
      console.log('[useBotStatusPolling.pollStatus] Début du polling pour bot:', botId);
      try {
        const status = await botService.getBotStatus(botId);
        console.log('[useBotStatusPolling.pollStatus] Statut reçu:', status);

        if (status.stage !== previousStageRef.current) {
          console.log('[useBotStatusPolling.pollStatus] Changement de stage:', previousStageRef.current, '->', status.stage);
          setStage(status.stage);
          previousStageRef.current = status.stage;
          onStageChange?.(status.stage);
        }

        if (status.stage === 'complete') {
          console.log('[useBotStatusPolling.pollStatus] Déploiement terminé');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onComplete?.();
        }

        if (status.stage === 'error') {
          console.error('[useBotStatusPolling.pollStatus] Erreur détectée dans le statut');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          const errorMsg = 'Erreur lors de la mise à jour du bot';
          setError(errorMsg);
          onError?.(errorMsg);
        }
      } catch (err: any) {
        console.error('[useBotStatusPolling.pollStatus] Exception lors du polling:', err);
        const errorMsg = err.message || 'Erreur lors de la vérification du statut';
        setError(errorMsg);
        onError?.(errorMsg);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    console.log('[useBotStatusPolling.useEffect] Premier appel à pollStatus');
    pollStatus();

    console.log('[useBotStatusPolling.useEffect] Création de l\'interval avec pollInterval:', pollInterval);
    intervalRef.current = setInterval(pollStatus, pollInterval);

    return () => {
      console.log('[useBotStatusPolling.useEffect] Cleanup de l\'effect');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, botId, pollInterval]);

  return { stage, error };
}
