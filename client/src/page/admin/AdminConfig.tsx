import { motion } from 'framer-motion';
import { FaSlidersH, FaSave } from 'react-icons/fa';
import AdminDashboardLayout from '../../component/dashboard/AdminDashboardLayout';

export default function AdminConfig() {
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
              <FaSlidersH className="text-purple-400 text-4xl" />
              <h1 className="text-4xl font-bold text-white">Configuration globale</h1>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
              <FaSave />
              Enregistrer les modifications
            </button>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Paramètres généraux</h2>
              <p className="text-slate-400 mb-4">
                Configuration de la plateforme et des services
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Nom de la plateforme</label>
                  <input
                    type="text"
                    value="HostYourBot"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">URL de base</label>
                  <input
                    type="text"
                    placeholder="https://hostyourbot.com"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Limites et quotas</h2>
              <p className="text-slate-400 mb-4">
                Définir les limites de ressources par utilisateur
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Nombre maximum de bots par utilisateur</label>
                  <input
                    type="number"
                    placeholder="5"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">RAM maximum par bot (Mo)</label>
                  <input
                    type="number"
                    placeholder="512"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Notifications</h2>
              <p className="text-slate-400 mb-4">
                Configuration des alertes et notifications système
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Webhook Discord</p>
                    <p className="text-slate-400 text-sm">Recevoir des alertes sur Discord</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AdminDashboardLayout>
  );
}
