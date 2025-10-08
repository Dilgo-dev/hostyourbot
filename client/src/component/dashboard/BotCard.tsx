import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaPlay,
  FaStop,
  FaRedo,
  FaTrash,
  FaNodeJs,
  FaPython,
  FaCircle
} from 'react-icons/fa';
import { SiGo, SiRust } from 'react-icons/si';
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
  const navigate = useNavigate();

  const getStatusColor = () => {
    switch (bot.status) {
      case 'running':
        return 'text-green-400';
      case 'stopped':
        return 'text-slate-400';
      case 'error':
        return 'text-red-400';
      case 'deploying':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  const getLanguageIcon = () => {
    switch (bot.language) {
      case 'nodejs':
        return <FaNodeJs className="text-xl text-green-400" />;
      case 'python':
        return <FaPython className="text-xl text-blue-400" />;
      case 'go':
        return <SiGo className="text-xl text-cyan-400" />;
      case 'rust':
        return <SiRust className="text-xl text-orange-400" />;
      default:
        return <FaNodeJs className="text-xl text-purple-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-purple-500/50 hover:bg-slate-800 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => navigate(`/dashboard/bots/${bot.id}`)}
        >
          <div className="w-10 h-10 bg-slate-700/70 rounded-lg flex items-center justify-center">
            {getLanguageIcon()}
          </div>
          <div>
            <h3 className="text-white font-semibold hover:text-purple-400 transition-colors">{bot.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <FaCircle className={`text-xs ${getStatusColor()}`} />
              <span className={`text-xs capitalize ${getStatusColor()}`}>{bot.status}</span>
              <span className="text-slate-500 text-xs">• {bot.version}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(bot.id)}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <FaTrash className="text-sm" />
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        {bot.status === 'running' ? (
          <>
            <button
              onClick={() => onStop(bot.id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FaStop className="text-xs" />
              Arrêter
            </button>
            <button
              onClick={() => onRestart(bot.id)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FaRedo className="text-xs" />
              Redémarrer
            </button>
          </>
        ) : (
          <button
            onClick={() => onStart(bot.id)}
            disabled={loading || bot.status === 'deploying'}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600/10 hover:bg-green-600/20 text-green-400 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <FaPlay className="text-xs" />
            Démarrer
          </button>
        )}
      </div>
    </motion.div>
  );
}
