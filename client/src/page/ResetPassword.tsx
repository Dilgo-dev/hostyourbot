import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { authApi } from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const validateForm = () => {
    if (!newPassword.trim()) {
      setError('Le nouveau mot de passe est requis');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (!token) {
      setError('Token de réinitialisation invalide');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await authApi.post('/api/auth/reset-password', { token, newPassword });
      setResetSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      const apiMessage = err?.response?.data?.error;
      setError(apiMessage || err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (error) setError('');
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (error) setError('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 pt-16">
        <div className="max-w-md w-full">
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Lien invalide</h1>
            <p className="text-slate-300 mb-6">
              Le lien de réinitialisation est invalide ou a expiré.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <FaArrowLeft />
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 pt-16">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              >
                <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-6" />
              </motion.div>

              <h1 className="text-2xl font-bold text-white mb-4">Mot de passe réinitialisé !</h1>

              <p className="text-slate-300 mb-6">
                Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion...
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                <FaArrowLeft />
                Se connecter maintenant
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 pt-16">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Nouveau mot de passe</h1>
            <p className="text-slate-400">Entrez votre nouveau mot de passe</p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10"
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full bg-slate-800/50 border ${
                      error ? 'border-red-500' : 'border-white/10'
                    } rounded-lg px-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmChange}
                    className={`w-full bg-slate-800/50 border ${
                      error ? 'border-red-500' : 'border-white/10'
                    } rounded-lg px-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50"
              >
                {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <FaArrowLeft />
                Retour à la connexion
              </Link>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}
