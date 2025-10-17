import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaRocket,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCog,
  FaUsers,
  FaRobot,
  FaServer,
  FaFileAlt,
  FaTachometerAlt,
  FaSlidersH
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

interface NavLink {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDiscordAvatarUrl = (discordId: string, discordAvatar: string) => {
    return `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.png?size=128`;
  };

  const getUserDisplayName = () => {
    if (user?.discordUsername) {
      return user.discordUsername;
    }
    return user?.email || 'Utilisateur';
  };

  const navLinks: NavLink[] = [
    { path: '/dashboard/admin', label: 'Vue d\'ensemble', icon: <FaTachometerAlt /> },
    { path: '/dashboard/admin/users', label: 'Utilisateurs', icon: <FaUsers /> },
    { path: '/dashboard/admin/bots', label: 'Bots', icon: <FaRobot /> },
    { path: '/dashboard/admin/system', label: 'Système', icon: <FaServer /> },
    { path: '/dashboard/admin/logs', label: 'Logs', icon: <FaFileAlt /> },
    { path: '/dashboard/admin/config', label: 'Configuration', icon: <FaSlidersH /> },
  ];

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 72 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 left-0 h-screen bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <FaRocket className="text-purple-400 text-2xl" />
              <span className="text-white text-xl font-bold">HostYourBot</span>
            </motion.button>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-purple-400 hover:opacity-80 transition-opacity cursor-pointer"
              title="Retour au Dashboard"
            >
              <FaRocket className="text-2xl" />
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors ml-auto"
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sidebarOpen ? (
            <div className="space-y-2">
              <p className="text-slate-400 text-xs uppercase tracking-wider px-2 mb-3">Administration</p>
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActiveLink(link.path)
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="font-medium text-sm">{link.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 ${
                    isActiveLink(link.path)
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                  title={link.label}
                >
                  {link.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                {user?.discordId && user?.discordAvatar ? (
                  <img
                    src={getDiscordAvatarUrl(user.discordId, user.discordAvatar)}
                    alt="Avatar Discord"
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-white text-sm" />
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <p className="text-white text-sm font-medium truncate">{getUserDisplayName()}</p>
                  {user?.discordUsername && user?.email && (
                    <p className="text-slate-400 text-xs truncate">{user.email}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200 mb-2"
              >
                <FaRocket className="text-lg" />
                <span className="font-medium text-sm">Mon Dashboard</span>
              </button>
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200 mb-2"
              >
                <FaCog className="text-lg" />
                <span className="font-medium text-sm">Paramètres</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="font-medium text-sm">Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200 mx-auto mb-2"
                title="Mon Dashboard"
              >
                <FaRocket className="text-lg" />
              </button>
              <button
                onClick={() => navigate('/dashboard/settings')}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all duration-200 mx-auto mb-2"
                title="Paramètres"
              >
                <FaCog className="text-lg" />
              </button>
              <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 mx-auto"
                title="Déconnexion"
              >
                <FaSignOutAlt className="text-lg" />
              </button>
            </>
          )}
        </div>
      </motion.aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
