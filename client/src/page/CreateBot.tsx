import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import DashboardLayout from '../component/dashboard/DashboardLayout';
import StepIndicator from '../component/createbot/StepIndicator';
import LanguageSelector from '../component/createbot/LanguageSelector';
import FileUploader from '../component/createbot/FileUploader';
import CommandInput from '../component/createbot/CommandInput';
import EnvVarEditor from '../component/createbot/EnvVarEditor';
import DeploymentSummary from '../component/createbot/DeploymentSummary';
import { botService, type EnvVar } from '../services/botService';

export default function CreateBot() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [language, setLanguage] = useState('nodejs');
  const [version, setVersion] = useState('LTS');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [startCommand, setStartCommand] = useState('');
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);

  const steps = ['Configuration', 'Fichiers', 'Commande', 'Variables', 'Récapitulatif'];

  const handleNext = () => {
    if (currentStep === 1 && !name.trim()) {
      setError('Veuillez entrer un nom pour votre bot');
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePrevious = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleDeploy = async () => {
    setError(null);
    setLoading(true);

    try {
      const validEnvVars = envVars.filter((v) => v.key && v.value);

      await botService.createBot({
        name,
        language,
        version,
        zipFile,
        startCommand: startCommand.trim() || undefined,
        envVars: validEnvVars,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du bot');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Nom du bot</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Mon Bot"
              />
            </div>
            <LanguageSelector
              selectedLanguage={language}
              selectedVersion={version}
              onLanguageChange={setLanguage}
              onVersionChange={setVersion}
            />
          </div>
        );

      case 2:
        return <FileUploader zipFile={zipFile} onFileChange={setZipFile} />;

      case 3:
        return <CommandInput command={startCommand} onCommandChange={setStartCommand} />;

      case 4:
        return <EnvVarEditor envVars={envVars} onEnvVarsChange={setEnvVars} />;

      case 5:
        return (
          <DeploymentSummary
            name={name}
            language={language}
            version={version}
            zipFile={zipFile}
            startCommand={startCommand}
            envVars={envVars}
          />
        );

      default:
        return null;
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
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <FaArrowLeft />
          Retour au dashboard
        </button>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
          <h1 className="text-white text-2xl font-bold mb-8">Créer un nouveau bot</h1>

          <StepIndicator currentStep={currentStep} totalSteps={steps.length} steps={steps} />

          {error && (
            <div className="bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="mb-8">{renderStepContent()}</div>

          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                <FaArrowLeft />
                Précédent
              </button>
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors ml-auto"
              >
                Suivant
                <FaArrowRight />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDeploy}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {loading ? 'Déploiement...' : 'Déployer le bot'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
