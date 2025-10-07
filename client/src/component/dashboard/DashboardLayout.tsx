import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRocket,
  FaHome,
  FaServer,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser,
  FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { icon: FaHome, label: 'Accueil', path: '/dashboard' },
    { icon: FaServer, label: 'Mes Bots', path: '/dashboard' },
    { icon: FaChartLine, label: 'Statistiques', path: '/dashboard/stats' },
    { icon: FaCog, label: 'Paramètres', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed lg:sticky top-0 left-0 h-screen w-70 bg-slate-800 border-r border-slate-700 z-40 flex flex-col"
          >
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <FaRocket className="text-purple-400 text-2xl" />
                <span className="text-white text-xl font-bold">HostYourBot</span>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-purple-600/20 rounded-lg transition-all duration-200 group"
                >
                  <item.icon className="text-lg group-hover:text-purple-400 transition-colors" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-white text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-slate-400 text-xs">Utilisateur</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-slate-800/95 backdrop-blur-lg border-b border-slate-700">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-purple-300 text-sm font-medium">Tous les services opérationnels</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
