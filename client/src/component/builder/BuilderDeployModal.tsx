import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { EnvVar, CreateBotRequest } from '../../services/botService';
import { botService } from '../../services/botService';
import { useAuth } from '../../context/AuthContext';
import EnvVarEditor from '../createbot/EnvVarEditor';
import UpdateProgressScreen, { type UpdateStage } from '../botdetail/UpdateProgressScreen';
import { useBotStatusPolling } from '../../hooks/useBotStatusPolling';

interface BuilderDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowName: string;
  zipFile: File;
  workflowId: string | null;
}

export default function BuilderDeployModal({
  isOpen,
  onClose,
  workflowName,
  zipFile,
  workflowId,
}: BuilderDeployModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deployStage, setDeployStage] = useState<UpdateStage | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [createdBotId, setCreatedBotId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);

  useBotStatusPolling({
    botId: createdBotId || '',
    enabled: pollingEnabled && !!createdBotId,
    onStageChange: (newStage) => {
      setDeployStage(newStage);
    },
    onComplete: () => {
      setPollingEnabled(false);
      setLoading(false);
      setTimeout(() => {
        navigate('/dashboard');
        onClose();
      }, 1500);
    },
    onError: (err) => {
      setError(err);
      setPollingEnabled(false);
      setLoading(false);
    },
    pollInterval: 1000,
  });

  useEffect(() => {
    if (isOpen) {
      setName(workflowName || 'Mon Bot Discord');
      setEnvVars([]);
      setError(null);
      setDeployStage(null);
      setCreatedBotId(null);
      setPollingEnabled(false);
    }
  }, [isOpen, workflowName]);

  const handleDeploy = async () => {
    if (!user) {
      setError('Utilisateur non authentifié');
      return;
    }

    if (!name.trim()) {
      setError('Veuillez entrer un nom pour votre bot');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      setDeployStage('validation');

      const validEnvVars = envVars.filter((v) => v.key && v.value);

      const deployData: CreateBotRequest = {
        name: name.trim(),
        language: 'nodejs',
        version: 'LTS',
        zipFile,
        startCommand: 'node index.js',
        envVars: validEnvVars,
        userId: user.id,
        workflowId: workflowId || undefined,
      };

      setDeployStage('upload');

      const createdBot = await botService.createBot(deployData);
      setCreatedBotId(createdBot.id);

      setDeployStage('config');
      setPollingEnabled(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du déploiement du bot');
      setLoading(false);
      setDeployStage(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ duration: 0.3 }}
          className="fixed right-0 top-0 h-screen w-[500px] bg-slate-800 border-l border-slate-700 flex flex-col shadow-2xl z-50"
        >
          <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-white text-2xl font-bold">Déployer le bot</h2>
              <p className="text-slate-400 text-sm mt-1">Configuration et déploiement automatique</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {deployStage ? (
            <UpdateProgressScreen currentStage={deployStage} hasZipFile={true} error={error} />
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {error && (
                  <div className="bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-400 text-sm">
                    💡 Votre bot sera déployé automatiquement en Node.js avec la commande de démarrage par défaut.
                  </p>
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Nom du bot *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Mon Bot Discord"
                  />
                </div>

                <div>
                  <h3 className="text-white text-sm font-medium mb-3">Variables d'environnement (optionnel)</h3>
                  <EnvVarEditor envVars={envVars} onEnvVarsChange={setEnvVars} />
                  <p className="text-xs text-slate-400 mt-2">
                    Ajoutez ici votre token Discord et autres variables nécessaires
                  </p>
                </div>

                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <h4 className="text-white text-sm font-semibold mb-2">Configuration automatique</h4>
                  <div className="space-y-1 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Langage : Node.js LTS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Commande : node index.js</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Code généré depuis le Builder</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 p-6 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleDeploy}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Déploiement...' : 'Déployer'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
