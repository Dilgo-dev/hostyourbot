import { motion } from 'framer-motion';
import BotCard from './BotCard';
import type { Bot } from '../../services/botService';

interface BotListProps {
  bots: Bot[];
  loading?: boolean;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function BotList({ bots, loading = false, onStart, onStop, onRestart, onDelete }: BotListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-slate-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-5 bg-slate-700 rounded w-32 mb-2" />
                <div className="h-6 bg-slate-700 rounded w-20" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="h-10 bg-slate-700 rounded" />
              <div className="h-10 bg-slate-700 rounded" />
              <div className="h-10 bg-slate-700 rounded" />
            </div>
            <div className="h-10 bg-slate-700 rounded mb-4" />
            <div className="h-10 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center"
      >
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Aucun bot pour le moment</h3>
          <p className="text-slate-400 mb-6">
            Créez votre premier bot pour commencer à l'héberger sur notre plateforme
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bots.map((bot, index) => (
        <motion.div
          key={bot.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <BotCard
            bot={bot}
            onStart={onStart}
            onStop={onStop}
            onRestart={onRestart}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </div>
  );
}
