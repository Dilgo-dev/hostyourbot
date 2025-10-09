import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaExclamationTriangle, FaEnvelope, FaShieldAlt, FaDiscord, FaDownload } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../component/dashboard/DashboardLayout';
import DeleteAccountModal from '../component/settings/DeleteAccountModal';
import TwoFactorSetup from '../component/settings/TwoFactorSetup';
import { accountService } from '../services/accountService';

export default function AccountSettings() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [exportingData, setExportingData] = useState(false);

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

  const getDiscordAvatarUrl = (discordId: string, discordAvatar: string) => {
    return `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatar}.png?size=256`;
  };

  const handle2FASuccess = async () => {
    setMessage({ type: 'success', text: 'Double authentification activée avec succès' });
    await refreshUser();
  };

  const handleDisable2FA = async () => {
    const password = prompt('Entrez votre mot de passe pour désactiver la 2FA :');

    if (!password) return;

    setDisabling2FA(true);
    setMessage(null);

    try {
      const response = await fetch('http://localhost:3001/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la désactivation');
      }

      setMessage({ type: 'success', text: 'Double authentification désactivée avec succès' });
      await refreshUser();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur lors de la désactivation de la 2FA' });
    } finally {
      setDisabling2FA(false);
    }
  };

  const handleExportData = async () => {
    setExportingData(true);
    setMessage(null);

    try {
      const blob = await accountService.exportUserData();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mes-donnees-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Vos données ont été téléchargées avec succès' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erreur lors du téléchargement de vos données' });
    } finally {
      setExportingData(false);
    }
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
              {user?.discordId && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Compte Discord</label>
                  <div className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      {user.discordAvatar && (
                        <img
                          src={getDiscordAvatarUrl(user.discordId, user.discordAvatar)}
                          alt="Avatar Discord"
                          className="w-16 h-16 rounded-full"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <FaDiscord className="text-indigo-400 text-lg" />
                          <p className="text-white font-medium">{user.discordUsername}</p>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">Connecté via Discord</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Adresse email</label>
                <div className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                  {user?.email || 'Non renseigné'}
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
            transition={{ delay: 0.25 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaShieldAlt className="text-purple-400 text-xl" />
              <h2 className="text-xl font-semibold text-white">Double authentification (2FA)</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-700 rounded-lg">
                <div>
                  <p className="text-white font-medium mb-1">
                    {user?.twoFactorEnabled ? 'Activée' : 'Désactivée'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {user?.twoFactorEnabled
                      ? 'Votre compte est protégé par la double authentification'
                      : 'Ajoutez une couche de sécurité supplémentaire à votre compte'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${user?.twoFactorEnabled ? 'bg-green-500' : 'bg-slate-600'}`} />
              </div>

              {!user?.twoFactorEnabled ? (
                <button
                  onClick={() => setShow2FASetup(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50"
                >
                  <FaShieldAlt />
                  Activer la double authentification
                </button>
              ) : (
                <button
                  onClick={handleDisable2FA}
                  disabled={disabling2FA}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaShieldAlt />
                  {disabling2FA ? 'Désactivation...' : 'Désactiver la double authentification'}
                </button>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaDownload className="text-purple-400 text-xl" />
              <h2 className="text-xl font-semibold text-white">Mes données</h2>
            </div>

            <div className="space-y-4">
              <p className="text-slate-400">
                Téléchargez une copie de toutes vos données personnelles au format JSON.
              </p>

              <button
                onClick={handleExportData}
                disabled={exportingData}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaDownload />
                {exportingData ? 'Téléchargement...' : 'Télécharger mes données'}
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
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

      <TwoFactorSetup
        isOpen={show2FASetup}
        onClose={() => setShow2FASetup(false)}
        onSuccess={handle2FASuccess}
      />
    </DashboardLayout>
  );
}
