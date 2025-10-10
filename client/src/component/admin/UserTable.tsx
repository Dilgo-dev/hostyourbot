import { FaEdit, FaTrash, FaUser, FaUserShield, FaDiscord, FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import type { AdminUser } from '../../services/adminService';

interface UserTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  currentUserId: string;
}

export default function UserTable({ users, onEdit, onDelete, currentUserId }: UserTableProps) {
  const getDiscordAvatarUrl = (discordId: string, discordAvatar: string) => {
    return `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.png?size=64`;
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Utilisateur</th>
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Email</th>
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Rôle</th>
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">2FA</th>
            <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">Date d'inscription</th>
            <th className="text-right py-4 px-4 text-slate-400 font-medium text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  {user.discordId && user.discordAvatar ? (
                    <img
                      src={getDiscordAvatarUrl(user.discordId, user.discordAvatar)}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-white text-sm" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {user.discordUsername || user.email?.split('@')[0] || 'Utilisateur'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {user.discordId && (
                        <span className="text-xs text-purple-400 flex items-center gap-1">
                          <FaDiscord />
                          Discord
                        </span>
                      )}
                      {user.email && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <FaEnvelope />
                          Email
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <p className="text-slate-300 text-sm">{user.email || '-'}</p>
              </td>
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {user.role === 'admin' ? <FaUserShield /> : <FaUser />}
                  {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                </span>
              </td>
              <td className="py-4 px-4">
                {user.twoFactorEnabled ? (
                  <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                    <FaShieldAlt />
                    Activé
                  </span>
                ) : (
                  <span className="text-slate-500 text-sm">Désactivé</span>
                )}
              </td>
              <td className="py-4 px-4">
                <p className="text-slate-300 text-sm">{formatDate(user.createdAt)}</p>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <FaEdit />
                  </button>
                  {user.id !== currentUserId && (
                    <button
                      onClick={() => onDelete(user)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">Aucun utilisateur trouvé</p>
        </div>
      )}
    </div>
  );
}
