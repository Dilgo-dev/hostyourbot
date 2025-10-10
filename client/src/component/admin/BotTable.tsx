import { FaRobot, FaCircle, FaPlay, FaStop, FaTrash, FaUser } from 'react-icons/fa';
import type { AdminBot } from '../../services/adminService';

interface BotTableProps {
  bots: AdminBot[];
  onStart: (bot: AdminBot) => void;
  onStop: (bot: AdminBot) => void;
  onDelete: (bot: AdminBot) => void;
}

export default function BotTable({ bots, onStart, onStop, onDelete }: BotTableProps) {
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

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'nodejs':
        return '🟢';
      case 'python':
        return '🐍';
      case 'go':
        return '🔵';
      case 'rust':
        return '🦀';
      default:
        return '📦';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Bot</th>
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Langage</th>
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Statut</th>
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Pods</th>
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Propriétaire</th>
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Date de création</th>
            <th className="text-right py-4 px-4 text-slate-400 font-medium text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bots.map((bot) => (
            <tr key={bot.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaRobot className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{bot.name}</p>
                    <p className="text-slate-400 text-xs">{bot.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getLanguageIcon(bot.language)}</span>
                  <div>
                    <p className="text-white text-sm capitalize">{bot.language}</p>
                    <p className="text-slate-400 text-xs">{bot.version}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <FaCircle className={`text-xs ${getStatusColor(bot.status)}`} />
                  <span className={`text-sm font-medium ${getStatusColor(bot.status)}`}>
                    {getStatusText(bot)}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-slate-300 text-sm">
                  {bot.podInfo?.ready || 0}/{bot.podInfo?.total || bot.replicas || 0}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <FaUser className="text-slate-400 text-xs" />
                  <span className="text-slate-300 text-sm">{bot.userId || 'Inconnu'}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <p className="text-slate-300 text-sm">{formatDate(bot.createdAt)}</p>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  {bot.replicas === 0 ? (
                    <button
                      onClick={() => onStart(bot)}
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                      title="Démarrer"
                    >
                      <FaPlay />
                    </button>
                  ) : (
                    <button
                      onClick={() => onStop(bot)}
                      className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                      title="Arrêter"
                    >
                      <FaStop />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(bot)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">Aucun bot trouvé</p>
        </div>
      )}
    </div>
  );
}
