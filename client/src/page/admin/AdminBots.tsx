import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaCircle, FaSync, FaSearch, FaFilter } from 'react-icons/fa';
import AdminDashboardLayout from '../../component/dashboard/AdminDashboardLayout';
import BotTable from '../../component/admin/BotTable';
import BotModal from '../../component/admin/BotModal';
import DeleteBotModal from '../../component/admin/DeleteBotModal';
import { adminService } from '../../services/adminService';
import type { AdminBot } from '../../services/adminService';

export default function AdminBots() {
  const [bots, setBots] = useState<AdminBot[]>([]);
  const [filteredBots, setFilteredBots] = useState<AdminBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    stopped: 0,
    error: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('');

  const [selectedBot, setSelectedBot] = useState<AdminBot | null>(null);
  const [botToDelete, setBotToDelete] = useState<AdminBot | null>(null);

  const loadBots = async () => {
    try {
      setLoading(true);
      setError(null);

      const [botsData, statsData] = await Promise.all([
        adminService.getBots(),
        adminService.getBotStats(),
      ]);

      setBots(botsData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading bots:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des bots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBots();
  }, []);

  useEffect(() => {
    let filtered = [...bots];

    if (searchTerm) {
      filtered = filtered.filter(
        (bot) =>
          bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bot.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((bot) => {
        if (statusFilter === 'stopped') {
          return bot.replicas === 0;
        }
        return bot.status === statusFilter;
      });
    }

    if (languageFilter) {
      filtered = filtered.filter((bot) => bot.language === languageFilter);
    }

    setFilteredBots(filtered);
  }, [bots, searchTerm, statusFilter, languageFilter]);

  const handleStartBot = async (bot: AdminBot) => {
    try {
      await adminService.startBot(bot.id);
      await loadBots();
    } catch (err: any) {
      console.error('Error starting bot:', err);
      alert(err.response?.data?.error || 'Erreur lors du démarrage du bot');
    }
  };

  const handleStopBot = async (bot: AdminBot) => {
    try {
      await adminService.stopBot(bot.id);
      await loadBots();
    } catch (err: any) {
      console.error('Error stopping bot:', err);
      alert(err.response?.data?.error || "Erreur lors de l'arrêt du bot");
    }
  };

  const handleDeleteBot = async (botId: string) => {
    try {
      await adminService.deleteBot(botId);
      await loadBots();
      setBotToDelete(null);
    } catch (err: any) {
      console.error('Error deleting bot:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression du bot');
    }
  };

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
              <FaRobot className="text-purple-400 text-4xl" />
              <div>
                <h1 className="text-4xl font-bold text-white">Surveillance des bots</h1>
                <p className="text-slate-400 mt-1">{stats.total} bot{stats.total > 1 ? 's' : ''} au total</p>
              </div>
            </div>
            <button
              onClick={loadBots}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FaCircle className="text-green-400 text-2xl" />
                <span className="text-slate-400 text-sm">Actifs</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.running}</h3>
              <p className="text-slate-400 text-sm">Bots en ligne</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FaCircle className="text-slate-400 text-2xl" />
                <span className="text-slate-400 text-sm">Inactifs</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.stopped}</h3>
              <p className="text-slate-400 text-sm">Bots arrêtés</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FaCircle className="text-red-400 text-2xl" />
                <span className="text-slate-400 text-sm">Erreurs</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.error}</h3>
              <p className="text-slate-400 text-sm">Bots en erreur</p>
            </motion.div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, ID ou propriétaire..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">Tous les statuts</option>
                  <option value="running">En ligne</option>
                  <option value="stopped">Arrêté</option>
                  <option value="error">Erreur</option>
                  <option value="deploying">Déploiement</option>
                </select>
              </div>
              <div className="relative">
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="pl-4 pr-8 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                >
                  <option value="">Tous les langages</option>
                  <option value="nodejs">Node.js</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400">{error}</p>
                <button
                  onClick={loadBots}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <BotTable
                bots={filteredBots}
                onStart={handleStartBot}
                onStop={handleStopBot}
                onDelete={setBotToDelete}
              />
            )}
          </motion.div>
        </motion.div>
      </div>

      {selectedBot && (
        <BotModal
          bot={selectedBot}
          onClose={() => setSelectedBot(null)}
        />
      )}

      {botToDelete && (
        <DeleteBotModal
          bot={botToDelete}
          onClose={() => setBotToDelete(null)}
          onConfirm={handleDeleteBot}
        />
      )}
    </AdminDashboardLayout>
  );
}
