import { motion } from 'framer-motion';
import { FaPlay, FaStop, FaRedo, FaTrash } from 'react-icons/fa';
import type { Bot } from '../../services/botService';

interface BotActionsProps {
  bot: Bot;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
  onDelete: () => void;
}

export default function BotActions({ bot, onStart, onStop, onRestart, onDelete }: BotActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
    >
      <h2 className="text-lg font-semibold text-white mb-4">Actions</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {bot.status === 'running' ? (
          <>
            <button
              onClick={onStop}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-all duration-200 border border-red-600/20 hover:border-red-600/40"
            >
              <FaStop />
              Arrêter
            </button>
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-lg transition-all duration-200 border border-purple-600/20 hover:border-purple-600/40"
            >
              <FaRedo />
              Redémarrer
            </button>
          </>
        ) : (
          <button
            onClick={onStart}
            disabled={bot.status === 'deploying'}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600/10 hover:bg-green-600/20 text-green-400 rounded-lg transition-all duration-200 border border-green-600/20 hover:border-green-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlay />
            Démarrer
          </button>
        )}

        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-red-600/20 text-slate-400 hover:text-red-400 rounded-lg transition-all duration-200 border border-slate-600 hover:border-red-600/40"
        >
          <FaTrash />
          Supprimer
        </button>
      </div>
    </motion.div>
  );
}
