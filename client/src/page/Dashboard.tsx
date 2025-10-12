import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaRedo } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../component/dashboard/DashboardLayout';
import BotList from '../component/dashboard/BotList';
import WorkflowList from '../component/dashboard/WorkflowList';
import { botService, type Bot } from '../services/botService';
import { builderService } from '../services/builderService';
import type { Workflow } from '../services/builderService';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
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
      const [botsData, workflowsData] = await Promise.all([
        botService.getBots(),
        builderService.getWorkflows(user!.id)
      ]);
      setBots(botsData);
      setWorkflows(workflowsData);
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

  const handleEditWorkflow = (id: string) => {
    navigate(`/dashboard/builder/${id}`);
  };

  const handleDeleteWorkflow = async (id: string) => {
    const associatedBots = bots.filter(bot => bot.workflowId === id);

    let confirmMessage = 'Êtes-vous sûr de vouloir supprimer ce workflow ?';

    if (associatedBots.length > 0) {
      const botNames = associatedBots.map(bot => bot.name).join(', ');
      confirmMessage = `⚠️ ATTENTION : Ce workflow est actuellement déployé sur ${associatedBots.length} bot(s) : ${botNames}.\n\n` +
        `La suppression de ce workflow entraînera également la suppression de tous les bots associés.\n\n` +
        `Voulez-vous vraiment continuer ?`;
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      if (associatedBots.length > 0) {
        await Promise.all(
          associatedBots.map(bot => botService.deleteBot(bot.id))
        );
      }

      await builderService.deleteWorkflow(id, user!.id);
      await loadDashboardData();
    } catch (error) {
      console.error('Erreur lors de la suppression du workflow:', error);
    }
  };

  const handleDownloadWorkflow = async (id: string) => {
    try {
      const blob = await builderService.generateFromWorkflow(id, user!.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bot-${id}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du workflow:', error);
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
            onClick={() => navigate('/dashboard/create/method')}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50"
          >
            <FaPlus />
            Nouveau bot
          </button>
        </div>

        <div className="mb-12">
          <h2 className="text-white text-2xl font-bold mb-6">Mes Bots</h2>
          <BotList
            bots={bots}
            loading={loading}
            onStart={handleStartBot}
            onStop={handleStopBot}
            onRestart={handleRestartBot}
            onDelete={handleDeleteBot}
          />
        </div>

        <div>
          <h2 className="text-white text-2xl font-bold mb-6">Mes Workflows</h2>
          <WorkflowList
            workflows={workflows}
            bots={bots}
            loading={loading}
            onEdit={handleEditWorkflow}
            onDelete={handleDeleteWorkflow}
            onDownload={handleDownloadWorkflow}
          />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
