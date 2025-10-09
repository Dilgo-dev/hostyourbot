import { motion } from 'framer-motion';
import { FaRobot, FaCircle } from 'react-icons/fa';
import AdminDashboardLayout from '../../component/dashboard/AdminDashboardLayout';

export default function AdminBots() {
  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <FaRobot className="text-purple-400 text-4xl" />
            <h1 className="text-4xl font-bold text-white">Surveillance des bots</h1>
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
              <h3 className="text-3xl font-bold text-white mb-1">-</h3>
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
              <h3 className="text-3xl font-bold text-white mb-1">-</h3>
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
              <h3 className="text-3xl font-bold text-white mb-1">-</h3>
              <p className="text-slate-400 text-sm">Bots en erreur</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Liste de tous les bots</h2>
            <p className="text-slate-400 text-center py-8">
              Fonctionnalité de surveillance des bots en développement
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AdminDashboardLayout>
  );
}
