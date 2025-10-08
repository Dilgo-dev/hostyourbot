import { motion } from 'framer-motion';
import {
  FaNodeJs,
  FaPython,
  FaCircle,
  FaClock,
  FaCalendar
} from 'react-icons/fa';
import { SiGo, SiRust } from 'react-icons/si';
import type { Bot } from '../../services/botService';

interface BotInfoProps {
  bot: Bot;
}

export default function BotInfo({ bot }: BotInfoProps) {
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

  const getStatusBgColor = () => {
    switch (bot.status) {
      case 'running':
        return 'bg-green-400/10';
      case 'stopped':
        return 'bg-slate-400/10';
      case 'error':
        return 'bg-red-400/10';
      case 'deploying':
        return 'bg-purple-400/10';
      default:
        return 'bg-slate-400/10';
    }
  };

  const getLanguageIcon = () => {
    switch (bot.language) {
      case 'nodejs':
        return <FaNodeJs className="text-3xl text-green-400" />;
      case 'python':
        return <FaPython className="text-3xl text-blue-400" />;
      case 'go':
        return <SiGo className="text-3xl text-cyan-400" />;
      case 'rust':
        return <SiRust className="text-3xl text-orange-400" />;
      default:
        return <FaNodeJs className="text-3xl text-purple-400" />;
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
    >
      <div className="flex items-start gap-6">
        <div className="w-16 h-16 bg-slate-700/70 rounded-lg flex items-center justify-center flex-shrink-0">
          {getLanguageIcon()}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2">{bot.name}</h1>

          <div className="flex items-center gap-4 flex-wrap">
            <div className={`flex items-center gap-2 px-3 py-1.5 ${getStatusBgColor()} rounded-lg`}>
              <FaCircle className={`text-xs ${getStatusColor()}`} />
              <span className={`text-sm font-medium capitalize ${getStatusColor()}`}>
                {bot.status}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="font-medium text-white">{bot.language}</span>
              <span>•</span>
              <span>{bot.version}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/10 rounded-lg flex items-center justify-center">
            <FaClock className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Uptime</p>
            <p className="text-white font-medium">{formatUptime(bot.uptime)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/10 rounded-lg flex items-center justify-center">
            <FaCalendar className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Créé le</p>
            <p className="text-white font-medium text-sm">{formatDate(bot.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/10 rounded-lg flex items-center justify-center">
            <FaCalendar className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Mis à jour le</p>
            <p className="text-white font-medium text-sm">{formatDate(bot.updatedAt)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
