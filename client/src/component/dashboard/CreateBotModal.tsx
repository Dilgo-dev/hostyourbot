import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDiscord, FaTelegram, FaRobot } from 'react-icons/fa';
import type { CreateBotRequest } from '../../services/botService';

interface CreateBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateBotRequest) => Promise<void>;
}

export default function CreateBotModal({ isOpen, onClose, onCreate }: CreateBotModalProps) {
  const [formData, setFormData] = useState<CreateBotRequest>({
    name: '',
    type: 'discord',
    token: '',
    replicas: 1,
    memory: '256Mi',
    cpu: '100m',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onCreate(formData);
      setFormData({
        name: '',
        type: 'discord',
        token: '',
        replicas: 1,
        memory: '256Mi',
        cpu: '100m',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du bot');
    } finally {
      setLoading(false);
    }
  };

  const botTypes = [
    { value: 'discord', label: 'Discord', icon: FaDiscord, color: 'indigo' },
    { value: 'telegram', label: 'Telegram', icon: FaTelegram, color: 'blue' },
    { value: 'other', label: 'Autre', icon: FaRobot, color: 'purple' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
              <h2 className="text-white text-2xl font-bold">Créer un nouveau bot</h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Nom du bot
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Mon Bot Discord"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-3">
                  Type de bot
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {botTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value as any })}
                      className={`p-4 border rounded-xl transition-all duration-200 ${
                        formData.type === type.value
                          ? `bg-${type.color}-600/20 border-${type.color}-500/50 text-${type.color}-400`
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <type.icon className="text-3xl mx-auto mb-2" />
                      <p className="text-sm font-medium">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Token du bot
                </label>
                <input
                  type="password"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                  placeholder="••••••••••••••••••••••••••••••"
                />
                <p className="text-slate-400 text-xs mt-2">
                  Le token de votre bot sera stocké de manière sécurisée
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Replicas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.replicas}
                    onChange={(e) => setFormData({ ...formData, replicas: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Mémoire
                  </label>
                  <select
                    value={formData.memory}
                    onChange={(e) => setFormData({ ...formData, memory: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="128Mi">128 Mi</option>
                    <option value="256Mi">256 Mi</option>
                    <option value="512Mi">512 Mi</option>
                    <option value="1Gi">1 Gi</option>
                    <option value="2Gi">2 Gi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    CPU
                  </label>
                  <select
                    value={formData.cpu}
                    onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="50m">50m</option>
                    <option value="100m">100m</option>
                    <option value="250m">250m</option>
                    <option value="500m">500m</option>
                    <option value="1000m">1000m</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création...' : 'Créer le bot'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
