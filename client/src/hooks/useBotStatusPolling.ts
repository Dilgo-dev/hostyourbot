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

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const pollStatus = async () => {
      try {
        const status = await botService.getBotStatus(botId);

        if (status.stage !== previousStageRef.current) {
          setStage(status.stage);
          previousStageRef.current = status.stage;
          onStageChange?.(status.stage);
        }

        if (status.stage === 'complete') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onComplete?.();
        }

        if (status.stage === 'error') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          const errorMsg = 'Erreur lors de la mise à jour du bot';
          setError(errorMsg);
          onError?.(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Erreur lors de la vérification du statut';
        setError(errorMsg);
        onError?.(errorMsg);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    pollStatus();

    intervalRef.current = setInterval(pollStatus, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, botId, pollInterval]);

  return { stage, error };
}
