import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError("L'email est requis");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("L'email n'est pas valide");
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEmailSent(true);
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  if (emailSent) {
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

              <h1 className="text-2xl font-bold text-white mb-4">Email envoyé !</h1>

              <p className="text-slate-300 mb-2">
                Un email de réinitialisation a été envoyé à :
              </p>
              <p className="text-purple-400 font-medium mb-6">{email}</p>

              <p className="text-slate-400 text-sm mb-8">
                Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                <FaArrowLeft />
                Retour à la connexion
              </Link>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-center text-sm text-slate-500"
            >
              Vous n'avez pas reçu l'email ?{' '}
              <button
                onClick={() => setEmailSent(false)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Renvoyer
              </button>
            </motion.p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Mot de passe oublié</h1>
            <p className="text-slate-400">Entrez votre email pour réinitialiser votre mot de passe</p>
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
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    className={`w-full bg-slate-800/50 border ${
                      error ? 'border-red-500' : 'border-white/10'
                    } rounded-lg px-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors`}
                    placeholder="john@example.com"
                  />
                </div>
                {error && (
                  <p className="mt-1 text-sm text-red-400">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
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
