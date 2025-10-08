import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaRocket,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaCircle,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { botService, type Bot } from '../../services/botService';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bots, setBots] = useState<Bot[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const botsData = await botService.getBots();
      setBots(botsData);
    } catch (error) {
      console.error('Erreur lors du chargement des bots:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
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

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 72 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 left-0 h-screen bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <FaRocket className="text-purple-400 text-2xl" />
              <span className="text-white text-xl font-bold">HostYourBot</span>
            </motion.div>
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
              <p className="text-slate-400 text-xs uppercase tracking-wider px-2 mb-3">Mes Bots</p>
              {bots.length === 0 ? (
                <p className="text-slate-500 text-sm px-2">Aucun bot</p>
              ) : (
                bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium truncate">{bot.name}</span>
                      <FaCircle className={`text-xs ${getStatusColor(bot.status)}`} />
                    </div>
                    <p className="text-slate-400 text-xs mt-1 capitalize">{bot.language} {bot.version}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  title={bot.name}
                >
                  <FaCircle className={`text-xs ${getStatusColor(bot.status)}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-white text-sm" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-white text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
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
