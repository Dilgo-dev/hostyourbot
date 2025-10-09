import { motion } from 'framer-motion';
import { FaFileAlt, FaFilter, FaDownload } from 'react-icons/fa';
import AdminDashboardLayout from '../../component/dashboard/AdminDashboardLayout';

export default function AdminLogs() {
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
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
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
              <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                <option>Tous les niveaux</option>
                <option>Info</option>
                <option>Warning</option>
                <option>Error</option>
              </select>
              <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                <option>Tous les services</option>
                <option>auth-service</option>
                <option>k8s-service</option>
                <option>logs-service</option>
                <option>mail-service</option>
              </select>
              <input
                type="date"
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
            <p className="text-slate-400 text-center py-8">
              Fonctionnalité de consultation des logs en développement
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AdminDashboardLayout>
  );
}
