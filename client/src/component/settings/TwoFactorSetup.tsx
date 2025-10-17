import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQrcode, FaCheck, FaTimes } from 'react-icons/fa';
import { authApi } from '../../services/api';

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TwoFactorSetup({ isOpen, onClose, onSuccess }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'generate' | 'verify'>('generate');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSecret = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.post('/api/auth/2fa/generate');
      setQrCodeUrl(response.data.qrCodeUrl);
      setSecret(response.data.secret);
      setStep('verify');
    } catch (err: any) {
      const apiMessage = err?.response?.data?.error;
      setError(apiMessage || err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.post('/api/auth/2fa/enable', { token: verificationCode });
      onSuccess();
      handleClose();
    } catch (err: any) {
      const apiMessage = err?.response?.data?.error;
      setError(apiMessage || err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('generate');
    setQrCodeUrl('');
    setSecret('');
    setVerificationCode('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaQrcode className="text-purple-400 text-2xl" />
              <h2 className="text-2xl font-bold text-white">Activer la 2FA</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {step === 'generate' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                La double authentification ajoute une couche de sécurité supplémentaire à votre compte.
                Vous aurez besoin d'une application d'authentification comme Google Authenticator ou Authy.
              </p>

              <button
                onClick={handleGenerateSecret}
                disabled={loading}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Génération...' : 'Commencer la configuration'}
              </button>
            </div>
          )}

          {step === 'verify' && qrCodeUrl && (
            <div className="space-y-4">
              <p className="text-slate-300 text-sm">
                Scannez ce QR code avec votre application d'authentification :
              </p>

              <div className="bg-white p-4 rounded-lg flex justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-2">
                  Si vous ne pouvez pas scanner le QR code, entrez ce code manuellement :
                </p>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-center">
                  <code className="text-purple-400 font-mono text-sm break-all">{secret}</code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Code de vérification à 6 chiffres
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-purple-500 transition-colors"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleVerifyAndEnable}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaCheck />
                  {loading ? 'Vérification...' : 'Activer'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
