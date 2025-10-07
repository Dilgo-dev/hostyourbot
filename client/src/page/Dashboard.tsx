import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaRedo } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../component/dashboard/DashboardLayout';
import Stats from '../component/dashboard/Stats';
import BotList from '../component/dashboard/BotList';
import CreateBotModal from '../component/dashboard/CreateBotModal';
import { botService, type Bot, type BotStats, type CreateBotRequest } from '../services/botService';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [stats, setStats] = useState<BotStats>({
    totalBots: 0,
    runningBots: 0,
    stoppedBots: 0,
    errorBots: 0,
    totalUptime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [botsData, statsData] = await Promise.all([
        botService.getBots(),
        botService.getStats(),
      ]);
      setBots(botsData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleCreateBot = async (data: CreateBotRequest) => {
    await botService.createBot(data);
    await loadDashboardData();
  };

  const handleStartBot = async (id: string) => {
    try {
      await botService.startBot(id);
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur lors du démarrage du bot:', error);
    }
  };

  const handleStopBot = async (id: string) => {
    try {
      await botService.stopBot(id);
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du bot:', error);
    }
  };

  const handleRestartBot = async (id: string) => {
    try {
      await botService.restartBot(id);
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur lors du redémarrage du bot:', error);
    }
  };

  const handleDeleteBot = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bot ?')) {
      return;
    }
    try {
      await botService.deleteBot(id);
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur lors de la suppression du bot:', error);
    }
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2">Tableau de bord</h1>
              <p className="text-slate-400">Gérez vos bots et surveillez leurs performances</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaRedo className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50"
              >
                <FaPlus />
                <span>Nouveau bot</span>
              </button>
            </div>
          </div>

          <Stats stats={stats} loading={loading} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl font-bold">Mes Bots</h2>
            <p className="text-slate-400">{bots.length} bot{bots.length > 1 ? 's' : ''}</p>
          </div>

          <BotList
            bots={bots}
            loading={loading}
            onStart={handleStartBot}
            onStop={handleStopBot}
            onRestart={handleRestartBot}
            onDelete={handleDeleteBot}
          />
        </motion.div>
      </div>

      <CreateBotModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateBot}
      />
    </DashboardLayout>
  );
}
