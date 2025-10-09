import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaExclamationTriangle, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../component/dashboard/DashboardLayout';
import DeleteAccountModal from '../component/settings/DeleteAccountModal';
import { accountService } from '../services/accountService';

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSendResetEmail = async () => {
    setMessage(null);

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user?.email }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'email');
      }

      setMessage({ type: 'success', text: 'Email de réinitialisation envoyé avec succès' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi de l\'email de réinitialisation' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    await accountService.deleteAccount();
    await logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-white mb-8">Paramètres du compte</h1>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaUser className="text-purple-400 text-xl" />
              <h2 className="text-xl font-semibold text-white">Informations du profil</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Adresse email</label>
                <div className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Membre depuis</label>
                <div className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                  {user?.createdAt && formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaLock className="text-purple-400 text-xl" />
              <h2 className="text-xl font-semibold text-white">Sécurité</h2>
            </div>

            <div className="space-y-4">
              <p className="text-slate-400">
                Pour modifier votre mot de passe, nous vous enverrons un email sécurisé avec un lien de réinitialisation.
              </p>

              <button
                onClick={handleSendResetEmail}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaEnvelope />
                {loading ? 'Envoi en cours...' : 'Envoyer un email de réinitialisation'}
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800 border border-red-900/50 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaExclamationTriangle className="text-red-400 text-xl" />
              <h2 className="text-xl font-semibold text-white">Zone de danger</h2>
            </div>

            <p className="text-slate-400 mb-4">
              La suppression de votre compte est permanente et irréversible. Tous vos bots seront supprimés.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaExclamationTriangle />
              Supprimer mon compte
            </button>
          </motion.section>
        </div>
      </motion.div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        userEmail={user?.email || ''}
      />
    </DashboardLayout>
  );
}
