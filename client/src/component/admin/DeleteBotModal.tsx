import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import type { AdminBot } from '../../services/adminService';

interface DeleteBotModalProps {
  bot: AdminBot;
  onClose: () => void;
  onConfirm: (botId: string) => void;
}

export default function DeleteBotModal({ bot, onClose, onConfirm }: DeleteBotModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-md w-full">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-white">Supprimer le bot</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-300 mb-4">
            Êtes-vous sûr de vouloir supprimer le bot <strong className="text-white">{bot.name}</strong> ?
          </p>
          <p className="text-slate-400 text-sm mb-2">
            Cette action est irréversible et entraînera :
          </p>
          <ul className="list-disc list-inside text-slate-400 text-sm space-y-1 mb-4">
            <li>Suppression du déploiement Kubernetes</li>
            <li>Suppression des pods et services associés</li>
            <li>Perte de toutes les données du bot</li>
          </ul>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <FaExclamationTriangle />
              Propriétaire : {bot.userId || 'Inconnu'}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(bot.id)}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
