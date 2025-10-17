import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

interface TwoFactorVerifyProps {
  tempToken: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function TwoFactorVerify({ tempToken, onSuccess, onBack }: TwoFactorVerifyProps) {
  const { verify2FA } = useAuth();
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (code.length === 6) {
      handleVerify();
    }
  }, [code]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verify2FA(tempToken, code);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCode(numericValue);
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 pt-16">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mb-4">
              <FaShieldAlt className="text-purple-400 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Vérification en deux étapes</h1>
            <p className="text-slate-400">
              Entrez le code à 6 chiffres de votre application d'authentification
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3 text-center">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="000000"
                  autoFocus
                  disabled={loading}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-4 text-white text-center text-3xl tracking-widest font-mono focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  maxLength={6}
                />
                <p className="mt-2 text-xs text-slate-500 text-center">
                  Le code sera vérifié automatiquement
                </p>
              </div>

              {loading && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              )}

              <button
                onClick={onBack}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaArrowLeft />
                Retour à la connexion
              </button>
            </div>
          </motion.div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Vous n'avez pas accès à votre application d'authentification ?
              <br />
              Contactez le support pour récupérer votre compte.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
