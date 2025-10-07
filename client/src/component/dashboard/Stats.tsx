import { motion } from 'framer-motion';
import { FaServer, FaCheckCircle, FaStopCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import type { BotStats } from '../../services/botService';

interface StatsProps {
  stats: BotStats;
  loading?: boolean;
}

export default function Stats({ stats, loading = false }: StatsProps) {
  const statItems = [
    {
      icon: FaServer,
      label: 'Total Bots',
      value: stats.totalBots,
      color: 'purple',
      bgColor: 'bg-purple-600/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    {
      icon: FaCheckCircle,
      label: 'En ligne',
      value: stats.runningBots,
      color: 'green',
      bgColor: 'bg-green-600/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
    },
    {
      icon: FaStopCircle,
      label: 'Arrêtés',
      value: stats.stoppedBots,
      color: 'slate',
      bgColor: 'bg-slate-600/20',
      borderColor: 'border-slate-500/30',
      iconColor: 'text-slate-400',
    },
    {
      icon: FaExclamationTriangle,
      label: 'Erreurs',
      value: stats.errorBots,
      color: 'red',
      bgColor: 'bg-red-600/20',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400',
    },
    {
      icon: FaClock,
      label: 'Uptime Moyen',
      value: `${Math.round(stats.totalUptime / 60)}h`,
      color: 'blue',
      bgColor: 'bg-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse"
          >
            <div className="h-10 w-10 bg-slate-700 rounded-lg mb-4" />
            <div className="h-4 bg-slate-700 rounded w-20 mb-2" />
            <div className="h-8 bg-slate-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-${item.color}-500/50 transition-all duration-300`}
        >
          <div className={`${item.bgColor} ${item.borderColor} border rounded-lg w-12 h-12 flex items-center justify-center mb-4`}>
            <item.icon className={`${item.iconColor} text-xl`} />
          </div>
          <p className="text-slate-400 text-sm mb-1">{item.label}</p>
          <p className="text-white text-3xl font-bold">{item.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
