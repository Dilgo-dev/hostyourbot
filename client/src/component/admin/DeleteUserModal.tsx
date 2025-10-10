import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationTriangle, FaUser } from 'react-icons/fa';
import type { AdminUser } from '../../services/adminService';

interface DeleteUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string) => void;
}

export default function DeleteUserModal({ user, onClose, onConfirm }: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!user) return null;

  const getUserDisplayName = () => {
    return user.discordUsername || user.email?.split('@')[0] || 'Utilisateur';
  };

  const getDiscordAvatarUrl = (discordId: string, discordAvatar: string) => {
    return `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.png?size=64`;
  };

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() !== 'supprimer') return;

    setIsDeleting(true);
    await onConfirm(user.id);
    setIsDeleting(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-400 text-xl" />
              </div>
              <h2 className="text-xl font-bold text-white">Supprimer l'utilisateur</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-slate-700/30 rounded-lg p-4 mb-4 flex items-center gap-3">
              {user.discordId && user.discordAvatar ? (
                <img
                  src={getDiscordAvatarUrl(user.discordId, user.discordAvatar)}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
              )}
              <div>
                <p className="text-white font-medium">{getUserDisplayName()}</p>
                <p className="text-slate-400 text-sm">{user.email || 'Sans email'}</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm mb-2">
                <strong>Attention :</strong> Cette action est irréversible !
              </p>
              <ul className="text-red-400 text-sm space-y-1 list-disc list-inside">
                <li>L'utilisateur sera définitivement supprimé</li>
                <li>Tous ses bots seront supprimés</li>
                <li>Toutes ses données seront perdues</li>
              </ul>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Tapez <span className="text-red-400 font-bold">SUPPRIMER</span> pour confirmer
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                placeholder="Tapez SUPPRIMER"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmText.toLowerCase() !== 'supprimer' || isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
