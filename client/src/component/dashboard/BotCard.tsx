import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaPlay,
  FaStop,
  FaRedo,
  FaTrash,
  FaEllipsisV,
  FaDiscord,
  FaTelegram,
  FaRobot,
  FaCheckCircle,
  FaStopCircle,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import type { Bot } from '../../services/botService';

interface BotCardProps {
  bot: Bot;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export default function BotCard({ bot, onStart, onStop, onRestart, onDelete, loading = false }: BotCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusIcon = () => {
    switch (bot.status) {
      case 'running':
        return <FaCheckCircle className="text-green-400" />;
      case 'stopped':
        return <FaStopCircle className="text-slate-400" />;
      case 'error':
        return <FaExclamationTriangle className="text-red-400" />;
      case 'deploying':
        return <FaSpinner className="text-purple-400 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (bot.status) {
      case 'running':
        return 'bg-green-600/20 border-green-500/30 text-green-400';
      case 'stopped':
        return 'bg-slate-600/20 border-slate-500/30 text-slate-400';
      case 'error':
        return 'bg-red-600/20 border-red-500/30 text-red-400';
      case 'deploying':
        return 'bg-purple-600/20 border-purple-500/30 text-purple-400';
    }
  };

  const getTypeIcon = () => {
    switch (bot.type) {
      case 'discord':
        return <FaDiscord className="text-2xl text-indigo-400" />;
      case 'telegram':
        return <FaTelegram className="text-2xl text-blue-400" />;
      default:
        return <FaRobot className="text-2xl text-purple-400" />;
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
            {getTypeIcon()}
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold">{bot.name}</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-medium mt-1 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="capitalize">{bot.status}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FaEllipsisV />
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-40 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-10"
            >
              <button
                onClick={() => {
                  onDelete(bot.id);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <FaTrash className="text-sm" />
                Supprimer
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-slate-400 text-xs mb-1">Replicas</p>
          <p className="text-white text-sm font-semibold">{bot.replicas}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Mémoire</p>
          <p className="text-white text-sm font-semibold">{bot.memory}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">CPU</p>
          <p className="text-white text-sm font-semibold">{bot.cpu}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-slate-400 text-xs mb-1">Uptime</p>
        <p className="text-white text-sm font-semibold">{formatUptime(bot.uptime)}</p>
      </div>

      <div className="flex gap-2">
        {bot.status === 'running' ? (
          <>
            <button
              onClick={() => onStop(bot.id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaStop />
              <span className="text-sm font-medium">Arrêter</span>
            </button>
            <button
              onClick={() => onRestart(bot.id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaRedo />
              <span className="text-sm font-medium">Redémarrer</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => onStart(bot.id)}
            disabled={loading || bot.status === 'deploying'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlay />
            <span className="text-sm font-medium">Démarrer</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
