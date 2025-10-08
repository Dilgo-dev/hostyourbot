import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaRedo } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../component/dashboard/DashboardLayout';
import BotList from '../component/dashboard/BotList';
import { botService, type Bot } from '../services/botService';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      const botsData = await botService.getBots();
      setBots(botsData);
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex justify-end gap-3 mb-8">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaRedo className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button
            onClick={() => navigate('/dashboard/create')}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50"
          >
            <FaPlus />
            Nouveau bot
          </button>
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
    </DashboardLayout>
  );
}
