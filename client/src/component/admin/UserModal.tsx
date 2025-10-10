import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUser, FaUserShield, FaDiscord, FaEnvelope, FaShieldAlt, FaCalendar } from 'react-icons/fa';
import type { AdminUser } from '../../services/adminService';

interface UserModalProps {
  user: AdminUser | null;
  currentUserId: string;
  onClose: () => void;
  onUpdateRole: (userId: string, role: 'user' | 'admin') => void;
}

export default function UserModal({ user, currentUserId, onClose, onUpdateRole }: UserModalProps) {
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>(user?.role || 'user');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) return null;

  const getDiscordAvatarUrl = (discordId: string, discordAvatar: string) => {
    return `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.png?size=128`;
  };

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

  const handleUpdateRole = async () => {
    if (selectedRole === user.role || user.id === currentUserId) return;

    setIsUpdating(true);
    await onUpdateRole(user.id, selectedRole);
    setIsUpdating(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Détails de l'utilisateur</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-700">
              {user.discordId && user.discordAvatar ? (
                <img
                  src={getDiscordAvatarUrl(user.discordId, user.discordAvatar)}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-2xl" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {user.discordUsername || user.email?.split('@')[0] || 'Utilisateur'}
                </h3>
                <p className="text-slate-400 text-sm">ID: {user.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <FaEnvelope />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-white">{user.email || 'Non renseigné'}</p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <FaDiscord />
                  <span className="text-sm font-medium">Discord</span>
                </div>
                <p className="text-white">
                  {user.discordUsername || 'Non connecté'}
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <FaShieldAlt />
                  <span className="text-sm font-medium">Authentification à deux facteurs</span>
                </div>
                <p className={user.twoFactorEnabled ? 'text-green-400' : 'text-slate-400'}>
                  {user.twoFactorEnabled ? 'Activé' : 'Désactivé'}
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <FaCalendar />
                  <span className="text-sm font-medium">Date d'inscription</span>
                </div>
                <p className="text-white">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-3">
                <FaUserShield />
                <span className="text-sm font-medium">Rôle de l'utilisateur</span>
              </div>

              {user.id === currentUserId ? (
                <p className="text-slate-400 text-sm">
                  Vous ne pouvez pas modifier votre propre rôle
                </p>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedRole('user')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                      selectedRole === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <FaUser />
                    Utilisateur
                  </button>
                  <button
                    onClick={() => setSelectedRole('admin')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                      selectedRole === 'admin'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <FaUserShield />
                    Administrateur
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
            {user.id !== currentUserId && selectedRole !== user.role && (
              <button
                onClick={handleUpdateRole}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Mise à jour...' : 'Mettre à jour le rôle'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
