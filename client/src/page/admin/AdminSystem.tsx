import { motion } from 'framer-motion';
import { FaServer, FaMemory, FaMicrochip, FaHdd, FaCircle } from 'react-icons/fa';
import AdminDashboardLayout from '../../component/dashboard/AdminDashboardLayout';
import MetricCard from '../../component/admin/metrics/MetricCard';
import MetricsChart from '../../component/admin/metrics/MetricsChart';
import NodesTable from '../../component/admin/metrics/NodesTable';
import { useMetrics } from '../../hooks/useMetrics';

export default function AdminSystem() {
  const { clusterMetrics, nodesMetrics, metricsHistory, loading, error } = useMetrics(5000);

  if (loading && !clusterMetrics) {
    return (
      <AdminDashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400 mb-4"></div>
              <p className="text-slate-400">Chargement des métriques...</p>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  if (error && !clusterMetrics) {
    return (
      <AdminDashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-red-400 mb-2">Erreur de chargement des métriques</p>
              <p className="text-slate-400 text-sm">{error}</p>
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
              <FaServer className="text-purple-400 text-4xl" />
              <h1 className="text-4xl font-bold text-white">Système et cluster Kubernetes</h1>
            </div>
            <div className="flex items-center gap-2">
              <FaCircle className="text-green-400 text-xs animate-pulse" />
              <span className="text-slate-400 text-sm">Mise à jour temps réel</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={FaMicrochip}
              title="CPU"
              value={`${clusterMetrics?.cpu.percentage.toFixed(1)}%`}
              subtitle="Utilisation"
              percentage={clusterMetrics?.cpu.percentage}
              delay={0.1}
              color="purple"
            />

            <MetricCard
              icon={FaMemory}
              title="RAM"
              value={`${clusterMetrics?.memory.percentage.toFixed(1)}%`}
              subtitle="Utilisation"
              percentage={clusterMetrics?.memory.percentage}
              delay={0.2}
              color="blue"
            />

            <MetricCard
              icon={FaHdd}
              title="Stockage"
              value={`${clusterMetrics?.storage.percentage.toFixed(1)}%`}
              subtitle="Utilisation"
              percentage={clusterMetrics?.storage.percentage}
              delay={0.3}
              color="green"
            />

            <MetricCard
              icon={FaServer}
              title="Nodes"
              value={`${clusterMetrics?.nodes.ready}/${clusterMetrics?.nodes.total}`}
              subtitle="Actifs"
              delay={0.4}
              color="yellow"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Métriques du cluster en temps réel</h2>

            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">CPU Total</p>
                  <p className="text-white text-2xl font-bold">
                    {clusterMetrics?.cpu.used.toFixed(1)} / {clusterMetrics?.cpu.total} cores
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Mémoire Totale</p>
                  <p className="text-white text-2xl font-bold">
                    {clusterMetrics?.memory.used.toFixed(1)} / {clusterMetrics?.memory.total} GB
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Stockage Total</p>
                  <p className="text-white text-2xl font-bold">
                    {clusterMetrics?.storage.used.toFixed(1)} / {clusterMetrics?.storage.total} GB
                  </p>
                </div>
              </div>
            </div>

            {metricsHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Historique des métriques</h3>
                <MetricsChart data={metricsHistory} />
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Pods du cluster</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Total</p>
                <p className="text-white text-3xl font-bold">{clusterMetrics?.pods.total}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Running</p>
                <p className="text-green-400 text-3xl font-bold">{clusterMetrics?.pods.running}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Pending</p>
                <p className="text-yellow-400 text-3xl font-bold">{clusterMetrics?.pods.pending}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm mb-1">Failed</p>
                <p className="text-red-400 text-3xl font-bold">{clusterMetrics?.pods.failed}</p>
              </div>
            </div>
          </motion.div>

          {nodesMetrics.length > 0 && <NodesTable nodes={nodesMetrics} />}
        </motion.div>
      </div>
    </AdminDashboardLayout>
  );
}
