import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserShield, FaUsers, FaRobot, FaServer } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../component/dashboard/DashboardLayout';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <FaUserShield className="text-purple-400 text-4xl" />
            <h1 className="text-4xl font-bold text-white">Dashboard Admin</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FaUsers className="text-purple-400 text-3xl" />
                <span className="text-slate-400 text-sm">Total</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">-</h3>
              <p className="text-slate-400 text-sm">Utilisateurs</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FaRobot className="text-purple-400 text-3xl" />
                <span className="text-slate-400 text-sm">Total</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">-</h3>
              <p className="text-slate-400 text-sm">Bots déployés</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FaServer className="text-purple-400 text-3xl" />
                <span className="text-slate-400 text-sm">État</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">-</h3>
              <p className="text-slate-400 text-sm">Ressources cluster</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Fonctionnalités d'administration</h2>
            <p className="text-slate-400 mb-4">
              Cette page sera bientôt enrichie avec des fonctionnalités d'administration complètes :
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-purple-400">•</span>
                Gestion des utilisateurs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">•</span>
                Surveillance des bots
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">•</span>
                Métriques du cluster Kubernetes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">•</span>
                Logs système
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-400">•</span>
                Configuration globale
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
