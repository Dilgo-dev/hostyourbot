import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaFileAlt, FaFilter, FaDownload, FaSpinner } from 'react-icons/fa';
import AdminDashboardLayout from '../../component/dashboard/AdminDashboardLayout';
import LogsTable from '../../component/admin/logs/LogsTable';
import { logsService, type AdminLog } from '../../services/logsService';

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    level: '',
    service_name: '',
    date: '',
  });

  const pageSize = 20;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await logsService.getLogs({
        level: filters.level,
        service_name: filters.service_name,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });

      setLogs(response.data);
      setTotal(response.total);
    } catch (err) {
      setError('Erreur lors du chargement des logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (logs.length > 0) {
      logsService.exportLogs(logs);
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
              <FaFileAlt className="text-purple-400 text-4xl" />
              <h1 className="text-4xl font-bold text-white">Logs système</h1>
            </div>
            <button
              onClick={handleExport}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              <FaDownload />
              Exporter les logs
            </button>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <FaFilter className="text-slate-400" />
              <span className="text-white font-medium">Filtres</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Tous les niveaux</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
                <option value="debug">Debug</option>
              </select>
              <select
                value={filters.service_name}
                onChange={(e) => handleFilterChange('service_name', e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Tous les services</option>
                <option value="auth-service">auth-service</option>
                <option value="k8s-service">k8s-service</option>
                <option value="logs-service">logs-service</option>
                <option value="mail-service">mail-service</option>
                <option value="webhook-service">webhook-service</option>
              </select>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Journal des événements</h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className="animate-spin text-purple-400 text-4xl" />
              </div>
            ) : (
              <LogsTable
                logs={logs}
                total={total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </AdminDashboardLayout>
  );
}
