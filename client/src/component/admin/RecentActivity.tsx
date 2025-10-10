import { motion } from 'framer-motion';
import { FaUserPlus, FaRobot, FaCircle } from 'react-icons/fa';
import type { AdminUser, AdminBot } from '../../services/adminService';

interface RecentActivityProps {
  recentUsers: AdminUser[];
  recentBots: AdminBot[];
}

export default function RecentActivity({ recentUsers, recentBots }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) {
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (hours < 24) {
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      running: 'text-green-400',
      stopped: 'text-slate-400',
      error: 'text-red-400',
      deploying: 'text-yellow-400',
    };
    return colors[status] || 'text-slate-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Activité récente</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FaUserPlus className="text-purple-400" />
            Nouveaux utilisateurs
          </h3>
          <div className="space-y-2">
            {recentUsers.length > 0 ? (
              recentUsers.slice(0, 5).map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {user.discordUsername || user.email || user.id}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xs">{formatDate(user.createdAt)}</span>
                </motion.div>
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center py-4">Aucun nouvel utilisateur récemment</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <FaRobot className="text-blue-400" />
            Bots récents
          </h3>
          <div className="space-y-2">
            {recentBots.length > 0 ? (
              recentBots.slice(0, 5).map((bot, index) => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaCircle className={`text-xs ${getStatusColor(bot.status)}`} />
                    <div>
                      <p className="text-white text-sm font-medium">{bot.name}</p>
                      <p className="text-slate-400 text-xs capitalize">{bot.language}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xs">{formatDate(bot.createdAt)}</span>
                </motion.div>
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center py-4">Aucun bot déployé récemment</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
