import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail: string;
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm, userEmail }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (confirmText !== 'supprimer') {
      setError('Veuillez taper "supprimer" pour confirmer');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du compte');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmText('');
      setError(null);
      onClose();
    }
  };

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
            className="bg-slate-800 border border-red-900/50 rounded-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600/10 border-b border-red-900/50 p-6 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-red-400 text-2xl" />
                <h2 className="text-white text-xl font-bold">Supprimer le compte</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 font-semibold mb-2">⚠️ Attention : Cette action est irréversible !</p>
                <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
                  <li>Votre compte sera définitivement supprimé</li>
                  <li>Tous vos bots seront arrêtés et supprimés</li>
                  <li>Toutes vos données seront perdues</li>
                  <li>Vous ne pourrez pas récupérer votre compte</li>
                </ul>
              </div>

              <div>
                <p className="text-slate-400 mb-3">
                  Compte : <span className="text-white font-medium">{userEmail}</span>
                </p>
                <p className="text-slate-300 mb-3">
                  Pour confirmer la suppression, tapez <span className="text-red-400 font-mono font-bold">supprimer</span> ci-dessous :
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="supprimer"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  autoFocus
                />
              </div>

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
                  disabled={loading || confirmText !== 'supprimer'}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaExclamationTriangle />
                  {loading ? 'Suppression...' : 'Supprimer définitivement'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
