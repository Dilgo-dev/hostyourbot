import { motion } from 'framer-motion';
import { FaServer, FaMemory, FaMicrochip, FaHdd } from 'react-icons/fa';
import AdminDashboardLayout from '../../component/dashboard/AdminDashboardLayout';

export default function AdminSystem() {
  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <FaServer className="text-purple-400 text-4xl" />
            <h1 className="text-4xl font-bold text-white">Système et cluster Kubernetes</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FaMicrochip className="text-purple-400 text-3xl" />
                <span className="text-slate-400 text-sm">CPU</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">-%</h3>
              <p className="text-slate-400 text-sm">Utilisation</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FaMemory className="text-purple-400 text-3xl" />
                <span className="text-slate-400 text-sm">RAM</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">-%</h3>
              <p className="text-slate-400 text-sm">Utilisation</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FaHdd className="text-purple-400 text-3xl" />
                <span className="text-slate-400 text-sm">Stockage</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">-%</h3>
              <p className="text-slate-400 text-sm">Utilisation</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <FaServer className="text-purple-400 text-3xl" />
                <span className="text-slate-400 text-sm">Nodes</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">-</h3>
              <p className="text-slate-400 text-sm">Actifs</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Métriques du cluster</h2>
            <p className="text-slate-400 text-center py-8">
              Fonctionnalité de monitoring du cluster Kubernetes en développement
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AdminDashboardLayout>
  );
}
