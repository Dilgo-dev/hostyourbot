import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUserShield,
  FaUsers,
  FaRobot,
  FaServer,
  FaMicrochip,
  FaMemory,
  FaHdd,
  FaUserPlus,
  FaShieldAlt,
  FaKey,
  FaDiscord,
  FaEnvelope,
  FaCircle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AdminDashboardLayout from '../component/dashboard/AdminDashboardLayout';
import StatCard from '../component/admin/StatCard';
import QuickActions from '../component/admin/QuickActions';
import RecentActivity from '../component/admin/RecentActivity';
import { adminService } from '../services/adminService';
import type { UserStatsResponse, BotStatsResponse, AdminUser, AdminBot } from '../services/adminService';
import { useMetrics } from '../hooks/useMetrics';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { clusterMetrics } = useMetrics(10000);

  const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);
  const [botStats, setBotStats] = useState<BotStatsResponse | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [recentBots, setRecentBots] = useState<AdminBot[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoadingStats(true);
      setError(null);

      const [userStatsData, botStatsData, usersData, botsData] = await Promise.all([
        adminService.getUserStats(),
        adminService.getBotStats(),
        adminService.getUsers(1, 10, '', '', 'createdAt', 'DESC'),
        adminService.getBots(),
      ]);

      setUserStats(userStatsData);
      setBotStats(botStatsData);
      setRecentUsers(usersData.users || []);
      setRecentBots((botsData || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des données');
    } finally {
      setLoadingStats(false);
    }
  };

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

  if (loadingStats) {
    return (
      <AdminDashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400 mb-4"></div>
              <p className="text-slate-400">Chargement du dashboard...</p>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-400 mb-2">Erreur de chargement</p>
              <p className="text-slate-400 text-sm mb-4">{error}</p>
              <button
                onClick={loadDashboardData}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FaUserShield className="text-purple-400 text-4xl" />
              <h1 className="text-4xl font-bold text-white">Dashboard Admin</h1>
            </div>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Actualiser
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={FaUsers}
              title="Total utilisateurs"
              value={userStats?.total || 0}
              subtitle="Comptes enregistrés"
              delay={0.1}
            />
            <StatCard
              icon={FaUserPlus}
              title="Nouveaux aujourd'hui"
              value={userStats?.newToday || 0}
              subtitle="Inscriptions récentes"
              delay={0.15}
            />
            <StatCard
              icon={FaRobot}
              title="Total bots"
              value={botStats?.total || 0}
              subtitle="Bots déployés"
              delay={0.2}
            />
            <StatCard
              icon={FaCircle}
              title="Bots actifs"
              value={botStats?.running || 0}
              subtitle="En ligne actuellement"
              delay={0.25}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={FaShieldAlt}
              title="Administrateurs"
              value={userStats?.admins || 0}
              subtitle="Comptes admin"
              delay={0.3}
            />
            <StatCard
              icon={FaKey}
              title="Avec 2FA"
              value={userStats?.with2FA || 0}
              subtitle="Double authentification"
              delay={0.35}
            />
            <StatCard
              icon={FaDiscord}
              title="Discord liés"
              value={userStats?.withDiscord || 0}
              subtitle="Comptes Discord"
              delay={0.4}
            />
            <StatCard
              icon={FaEnvelope}
              title="Email liés"
              value={userStats?.withEmail || 0}
              subtitle="Adresses email"
              delay={0.45}
            />
            <StatCard
              icon={FaCircle}
              title="Bots arrêtés"
              value={botStats?.stopped || 0}
              subtitle="Hors ligne"
              delay={0.5}
            />
            <StatCard
              icon={FaCircle}
              title="Bots en erreur"
              value={botStats?.error || 0}
              subtitle="Nécessitent attention"
              delay={0.55}
            />
          </div>

          {clusterMetrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FaServer className="text-purple-400" />
                Ressources du cluster
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaMicrochip className="text-purple-400 text-2xl" />
                    <div>
                      <p className="text-slate-400 text-sm">CPU</p>
                      <p className="text-white text-2xl font-bold">
                        {clusterMetrics.cpu.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(clusterMetrics.cpu.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    {clusterMetrics.cpu.used.toFixed(1)} / {clusterMetrics.cpu.total} cores
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaMemory className="text-blue-400 text-2xl" />
                    <div>
                      <p className="text-slate-400 text-sm">RAM</p>
                      <p className="text-white text-2xl font-bold">
                        {clusterMetrics.memory.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(clusterMetrics.memory.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    {clusterMetrics.memory.used.toFixed(1)} / {clusterMetrics.memory.total} GB
                  </p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FaHdd className="text-green-400 text-2xl" />
                    <div>
                      <p className="text-slate-400 text-sm">Stockage</p>
                      <p className="text-white text-2xl font-bold">
                        {clusterMetrics.storage.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(clusterMetrics.storage.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    {clusterMetrics.storage.used.toFixed(1)} / {clusterMetrics.storage.total} GB
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <QuickActions />
            <RecentActivity recentUsers={recentUsers} recentBots={recentBots} />
          </div>
        </motion.div>
      </div>
    </AdminDashboardLayout>
  );
}
