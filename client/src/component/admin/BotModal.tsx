import { FaTimes, FaRobot, FaCircle, FaUser, FaCube, FaCalendar, FaServer } from 'react-icons/fa';
import type { AdminBot } from '../../services/adminService';

interface BotModalProps {
  bot: AdminBot;
  onClose: () => void;
}

export default function BotModal({ bot, onClose }: BotModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusText = (bot: AdminBot) => {
    if (bot.replicas === 0) return 'Arrêté';
    switch (bot.status) {
      case 'running':
        return 'En ligne';
      case 'stopped':
        return 'Arrêté';
      case 'error':
        return 'Erreur';
      case 'deploying':
        return 'Déploiement';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{bot.name}</h2>
              <p className="text-slate-400 text-sm">{bot.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Informations générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaCircle className={`text-xs ${getStatusColor(bot.status)}`} />
                  <span className="text-slate-400 text-sm">Statut</span>
                </div>
                <p className={`text-lg font-semibold ${getStatusColor(bot.status)}`}>
                  {getStatusText(bot)}
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaUser className="text-slate-400 text-xs" />
                  <span className="text-slate-400 text-sm">Propriétaire</span>
                </div>
                <p className="text-lg font-semibold text-white">{bot.userId || 'Inconnu'}</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaCube className="text-slate-400 text-xs" />
                  <span className="text-slate-400 text-sm">Langage</span>
                </div>
                <p className="text-lg font-semibold text-white capitalize">
                  {bot.language} <span className="text-slate-400 text-sm">{bot.version}</span>
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaServer className="text-slate-400 text-xs" />
                  <span className="text-slate-400 text-sm">Pods</span>
                </div>
                <p className="text-lg font-semibold text-white">
                  {bot.podInfo?.ready || 0}/{bot.podInfo?.total || bot.replicas || 0}
                </p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendar className="text-slate-400 text-xs" />
                  <span className="text-slate-400 text-sm">Date de création</span>
                </div>
                <p className="text-lg font-semibold text-white">{formatDate(bot.createdAt)}</p>
              </div>

              {bot.namespace && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-400 text-sm">Namespace</span>
                  </div>
                  <p className="text-lg font-semibold text-white">{bot.namespace}</p>
                </div>
              )}
            </div>
          </div>

          {bot.image && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Image Docker</h3>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <code className="text-purple-400 text-sm break-all">{bot.image}</code>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
