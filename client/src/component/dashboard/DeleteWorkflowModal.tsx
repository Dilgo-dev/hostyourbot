import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationTriangle, FaRobot } from 'react-icons/fa';
import type { Workflow } from '../../services/builderService';
import type { Bot } from '../../services/botService';

interface DeleteWorkflowModalProps {
  isOpen: boolean;
  workflow: Workflow | null;
  associatedBots: Bot[];
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteWorkflowModal({
  isOpen,
  workflow,
  associatedBots,
  onClose,
  onConfirm
}: DeleteWorkflowModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAssociatedBots = associatedBots.length > 0;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du workflow');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!workflow) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`bg-slate-800 rounded-xl max-w-lg w-full ${
              hasAssociatedBots ? 'border border-red-900/50' : 'border border-slate-700'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`p-6 border-b flex items-center justify-between rounded-t-xl ${
                hasAssociatedBots
                  ? 'bg-red-600/10 border-red-900/50'
                  : 'border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <FaExclamationTriangle
                  className={`text-2xl ${
                    hasAssociatedBots ? 'text-red-400' : 'text-yellow-400'
                  }`}
                />
                <h2 className="text-white text-xl font-bold">Supprimer le workflow</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-slate-300 mb-2">
                  Êtes-vous sûr de vouloir supprimer le workflow{' '}
                  <strong className="text-white">{workflow.name}</strong> ?
                </p>
                {workflow.description && (
                  <p className="text-slate-400 text-sm italic">
                    "{workflow.description}"
                  </p>
                )}
              </div>

              {hasAssociatedBots ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <FaExclamationTriangle className="text-red-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-red-400 font-semibold mb-2">
                        Attention : Ce workflow est actuellement déployé
                      </p>
                      <p className="text-slate-300 text-sm mb-3">
                        La suppression de ce workflow entraînera également la suppression
                        de {associatedBots.length} bot(s) déployé(s) :
                      </p>
                      <div className="space-y-2">
                        {associatedBots.map((bot) => (
                          <div
                            key={bot.id}
                            className="flex items-center gap-2 bg-slate-800/50 rounded px-3 py-2"
                          >
                            <FaRobot className="text-purple-400" />
                            <span className="text-white font-medium">{bot.name}</span>
                            <span
                              className={`ml-auto text-xs px-2 py-1 rounded ${
                                bot.status === 'running'
                                  ? 'bg-green-600/20 text-green-400'
                                  : bot.status === 'stopped'
                                  ? 'bg-slate-600/20 text-slate-400'
                                  : 'bg-red-600/20 text-red-400'
                              }`}
                            >
                              {bot.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">
                    Cette action est irréversible. Le workflow et toutes ses données seront
                    définitivement supprimés.
                  </p>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaExclamationTriangle />
                  {loading ? 'Suppression...' : hasAssociatedBots ? 'Supprimer tout' : 'Supprimer'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
