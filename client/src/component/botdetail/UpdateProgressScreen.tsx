import { motion } from 'framer-motion';
import { FaCheck, FaSpinner, FaTimes, FaUpload, FaCog, FaRedo, FaCheckCircle } from 'react-icons/fa';

export type UpdateStage = 'validation' | 'upload' | 'config' | 'restart' | 'complete';

interface UpdateProgressScreenProps {
  currentStage: UpdateStage;
  hasZipFile: boolean;
  error?: string | null;
  onContinue?: () => void;
}

interface Step {
  id: UpdateStage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function UpdateProgressScreen({
  currentStage,
  hasZipFile,
  error,
}: UpdateProgressScreenProps) {
  const allSteps: Step[] = [
    { id: 'validation', label: 'Validation des modifications', icon: FaCheckCircle },
    { id: 'upload', label: 'Upload du nouveau fichier', icon: FaUpload },
    { id: 'config', label: 'Mise à jour de la configuration', icon: FaCog },
    { id: 'restart', label: 'Redémarrage des pods', icon: FaRedo },
    { id: 'complete', label: 'Mise à jour terminée', icon: FaCheckCircle },
  ];

  const steps = hasZipFile
    ? allSteps
    : allSteps.filter((step) => step.id !== 'upload');

  const currentStepIndex = steps.findIndex((step) => step.id === currentStage);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const getStepState = (stepId: UpdateStage) => {
    const stepIndex = steps.findIndex((step) => step.id === stepId);
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepId === currentStage) return 'in_progress';
    return 'pending';
  };

  const getStepIcon = (step: Step) => {
    const state = getStepState(step.id);

    if (error && step.id === currentStage) {
      return <FaTimes className="text-red-400" />;
    }

    if (state === 'completed') {
      return <FaCheck className="text-green-400" />;
    }

    if (state === 'in_progress') {
      return <FaSpinner className="text-purple-400 animate-spin" />;
    }

    return <step.icon className="text-slate-500" />;
  };

  const getStepColor = (step: Step) => {
    const state = getStepState(step.id);

    if (error && step.id === currentStage) {
      return 'text-red-400 border-red-400/30 bg-red-400/10';
    }

    if (state === 'completed') {
      return 'text-green-400 border-green-400/30 bg-green-400/10';
    }

    if (state === 'in_progress') {
      return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
    }

    return 'text-slate-500 border-slate-700 bg-slate-800/50';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">
            {error ? 'Erreur lors de la mise à jour' : 'Mise à jour en cours...'}
          </h3>
          <p className="text-slate-400 text-sm">
            {error
              ? 'Une erreur est survenue pendant la mise à jour'
              : 'Veuillez patienter pendant que nous mettons à jour votre bot'}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {steps.map((step, index) => {
            const state = getStepState(step.id);
            const isError = error && step.id === currentStage;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${getStepColor(
                  step
                )}`}
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-900/50">
                  {getStepIcon(step)}
                </div>

                <div className="flex-1">
                  <p className="font-medium">{step.label}</p>
                  {state === 'in_progress' && !isError && (
                    <p className="text-xs text-slate-400 mt-1">En cours...</p>
                  )}
                  {state === 'completed' && (
                    <p className="text-xs text-green-400/70 mt-1">Terminé</p>
                  )}
                  {isError && (
                    <p className="text-xs text-red-400/70 mt-1">Échec</p>
                  )}
                </div>

                {state === 'completed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                      <FaCheck className="text-green-400 text-sm" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {!error && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            <p className="font-medium mb-1">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
