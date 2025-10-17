import { motion } from 'framer-motion';
import { FaServer, FaExclamationTriangle } from 'react-icons/fa';
import { useSubscription } from '../../context/SubscriptionContext';
import { Link } from 'react-router-dom';

export default function UsageQuota() {
  const { limits, loading } = useSubscription();

  if (loading || !limits) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-slate-700 rounded"></div>
      </div>
    );
  }

  const percentage = (limits.currentBots / limits.maxBots) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = !limits.canCreateBot;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800 rounded-lg p-6 border-2 ${
        isAtLimit
          ? 'border-red-500'
          : isNearLimit
          ? 'border-yellow-500'
          : 'border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaServer className="text-purple-400 text-xl" />
          <div>
            <h3 className="text-white font-semibold">Utilisation des bots</h3>
            <p className="text-slate-400 text-sm">
              {limits.currentBots} / {limits.maxBots === 999999 ? '∞' : limits.maxBots} bots utilisés
            </p>
          </div>
        </div>

        {isNearLimit && (
          <FaExclamationTriangle
            className={`${isAtLimit ? 'text-red-400' : 'text-yellow-400'} text-xl`}
          />
        )}
      </div>

      <div className="mb-4">
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              isAtLimit
                ? 'bg-red-500'
                : isNearLimit
                ? 'bg-yellow-500'
                : 'bg-purple-500'
            }`}
          />
        </div>
      </div>

      {isAtLimit ? (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-300 text-sm mb-2 font-semibold">
            Limite atteinte
          </p>
          <p className="text-slate-300 text-sm mb-3">
            Vous avez atteint le nombre maximum de bots pour votre plan. Améliorez votre plan pour créer plus de bots.
          </p>
          <Link
            to="/pricing"
            className="inline-block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Voir les plans
          </Link>
        </div>
      ) : isNearLimit ? (
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
          <p className="text-yellow-300 text-sm">
            Vous approchez de la limite de votre plan. Pensez à améliorer votre abonnement.
          </p>
        </div>
      ) : (
        <div className="text-slate-400 text-sm">
          <p>
            Vous pouvez encore créer{' '}
            <span className="text-purple-400 font-semibold">
              {limits.maxBots === 999999
                ? 'un nombre illimité de'
                : limits.maxBots - limits.currentBots}
            </span>{' '}
            bot{limits.maxBots - limits.currentBots !== 1 ? 's' : ''}.
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Replicas max</p>
            <p className="text-white font-semibold">{limits.maxReplicas}</p>
          </div>
          <div>
            <p className="text-slate-400">CPU par bot</p>
            <p className="text-white font-semibold">{limits.maxCpuPerBot}</p>
          </div>
          <div>
            <p className="text-slate-400">RAM par bot</p>
            <p className="text-white font-semibold">{limits.maxMemoryPerBot}</p>
          </div>
          <div>
            <Link
              to="/pricing"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors flex items-center gap-1"
            >
              Améliorer →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
