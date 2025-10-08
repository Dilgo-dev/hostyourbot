import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import DashboardLayout from '../component/dashboard/DashboardLayout';
import BotInfo from '../component/botdetail/BotInfo';
import BotLogs from '../component/botdetail/BotLogs';
import BotActions from '../component/botdetail/BotActions';
import { botService, type Bot } from '../services/botService';

export default function BotDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadBotData();
      loadLogs();
    }
  }, [id]);

  const loadBotData = async () => {
    try {
      setLoading(true);
      console.log('Chargement du bot avec ID:', id);
      const botData = await botService.getBot(id!);
      console.log('Données du bot reçues:', botData);
      setBot(botData);
    } catch (error) {
      console.error('Erreur lors du chargement du bot:', error);
      navigate('/dashboard');
    } finally {
      console.log('Fin du chargement, loading = false');
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLogsLoading(true);
      console.log('Chargement des logs pour le bot:', id);
      const logsData = await botService.getLogs(id!);
      console.log('Logs reçus:', logsData);
      setLogs(logsData);
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      await botService.startBot(id!);
      await loadBotData();
    } catch (error) {
      console.error('Erreur lors du démarrage du bot:', error);
    }
  };

  const handleStop = async () => {
    try {
      await botService.stopBot(id!);
      await loadBotData();
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du bot:', error);
    }
  };

  const handleRestart = async () => {
    try {
      await botService.restartBot(id!);
      await loadBotData();
    } catch (error) {
      console.error('Erreur lors du redémarrage du bot:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bot ?')) {
      return;
    }
    try {
      await botService.deleteBot(id!);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la suppression du bot:', error);
    }
  };

  const handleRefreshLogs = async () => {
    await loadLogs();
  };

  if (loading || !bot) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-700 rounded w-48" />
            <div className="h-64 bg-slate-800 rounded-lg" />
            <div className="h-96 bg-slate-800 rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <FaArrowLeft />
          Retour au tableau de bord
        </button>

        <div className="space-y-6">
          <BotInfo bot={bot} />

          <BotActions
            bot={bot}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
            onDelete={handleDelete}
          />

          <BotLogs
            logs={logs}
            loading={logsLoading}
            onRefresh={handleRefreshLogs}
          />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
