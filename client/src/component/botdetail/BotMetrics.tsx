import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaChartLine, FaSync } from 'react-icons/fa';
import { botService, type BotMetrics as BotMetricsData } from '../../services/botService';

interface BotMetricsProps {
  botId: string;
}

interface MetricPoint {
  time: string;
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
}

export default function BotMetrics({ botId }: BotMetricsProps) {
  const [currentMetrics, setCurrentMetrics] = useState<BotMetricsData | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<MetricPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await botService.getBotMetrics(botId);
      setCurrentMetrics(data);

      const formattedPoint: MetricPoint = {
        time: new Date(data.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        cpu: data.cpu,
        memory: data.memory,
        networkIn: data.network.received,
        networkOut: data.network.transmitted,
      };

      setMetricsHistory((prevHistory) => {
        const newHistory = [...prevHistory, formattedPoint];
        if (newHistory.length > 60) {
          return newHistory.slice(-60);
        }
        return newHistory;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des métriques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [botId]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, botId]);

  if (loading && !currentMetrics) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <FaChartLine className="text-2xl text-purple-400" />
          <h2 className="text-xl font-bold text-white">Métriques de performance</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-slate-700 rounded" />
          <div className="h-64 bg-slate-700 rounded" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <FaChartLine className="text-2xl text-purple-400" />
          <h2 className="text-xl font-bold text-white">Métriques de performance</h2>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-2xl text-purple-400" />
          <h2 className="text-xl font-bold text-white">Métriques de performance</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button
            onClick={loadMetrics}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">CPU actuel</p>
          <p className="text-2xl font-bold text-purple-400">
            {currentMetrics?.cpu.toFixed(2)} <span className="text-sm text-slate-400">millicores</span>
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">Mémoire actuelle</p>
          <p className="text-2xl font-bold text-blue-400">
            {currentMetrics?.memory.toFixed(2)} <span className="text-sm text-slate-400">MiB</span>
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">Réseau</p>
          <p className="text-sm text-green-400">
            ↓ {currentMetrics?.network.received.toFixed(2)} KiB
          </p>
          <p className="text-sm text-orange-400">
            ↑ {currentMetrics?.network.transmitted.toFixed(2)} KiB
          </p>
        </div>
      </div>

      {metricsHistory.length === 0 ? (
        <div className="bg-slate-700/30 rounded-lg p-6 text-center">
          <p className="text-slate-400">
            Les graphiques se rempliront progressivement avec les vraies métriques...
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Prochain point dans {autoRefresh ? '30 secondes' : 'pause (auto-refresh désactivé)'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Utilisation CPU ({metricsHistory.length} point{metricsHistory.length > 1 ? 's' : ''})
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{ value: 'millicores', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={metricsHistory.length < 10}
                  name="CPU (millicores)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Utilisation Mémoire ({metricsHistory.length} point{metricsHistory.length > 1 ? 's' : ''})
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{ value: 'MiB', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={metricsHistory.length < 10}
                  name="Mémoire (MiB)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Réseau ({metricsHistory.length} point{metricsHistory.length > 1 ? 's' : ''})
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{ value: 'KiB', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                  }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="networkIn"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={metricsHistory.length < 10}
                  name="Réception (KiB)"
                />
                <Line
                  type="monotone"
                  dataKey="networkOut"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={metricsHistory.length < 10}
                  name="Transmission (KiB)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </motion.div>
  );
}
