import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import type { Bot, EnvVar, CreateBotRequest } from '../../services/botService';
import LanguageSelector from '../createbot/LanguageSelector';
import FileUploader from '../createbot/FileUploader';
import CommandInput from '../createbot/CommandInput';
import EnvVarEditor from '../createbot/EnvVarEditor';

interface BotUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  bot: Bot;
  onUpdate: (data: Partial<CreateBotRequest>) => Promise<void>;
}

type Tab = 'config' | 'files' | 'command' | 'env';

export default function BotUpdateModal({ isOpen, onClose, bot, onUpdate }: BotUpdateModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('config');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(bot.name);
  const [language, setLanguage] = useState(bot.language);
  const [version, setVersion] = useState(bot.version);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [startCommand, setStartCommand] = useState('');
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);

  useEffect(() => {
    if (isOpen) {
      setName(bot.name);
      setLanguage(bot.language);
      setVersion(bot.version);
      setZipFile(null);
      setStartCommand('');
      setEnvVars([]);
      setError(null);
      setActiveTab('config');
    }
  }, [isOpen, bot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updateData: Partial<CreateBotRequest> = {};

      if (name !== bot.name) {
        updateData.name = name;
      }

      if (language !== bot.language) {
        updateData.language = language;
      }

      if (version !== bot.version) {
        updateData.version = version;
      }

      if (zipFile) {
        updateData.zipFile = zipFile;
      }

      if (startCommand.trim()) {
        updateData.startCommand = startCommand.trim();
      }

      if (envVars.length > 0) {
        const validEnvVars = envVars.filter((v) => v.key && v.value);
        if (validEnvVars.length > 0) {
          updateData.envVars = validEnvVars;
        }
      }

      if (Object.keys(updateData).length === 0) {
        setError('Aucune modification détectée. Veuillez modifier au moins un champ.');
        setLoading(false);
        return;
      }

      await onUpdate(updateData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du bot');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'config' as Tab, label: 'Configuration', description: 'Nom, langage et version' },
    { id: 'files' as Tab, label: 'Fichiers', description: 'Code source (ZIP)' },
    { id: 'command' as Tab, label: 'Commande', description: 'Commande de démarrage' },
    { id: 'env' as Tab, label: 'Variables', description: 'Variables d\'environnement' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'config':
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

      case 'files':
        return (
          <div className="space-y-4">
            <FileUploader zipFile={zipFile} onFileChange={setZipFile} />
            <div className="bg-orange-600/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-orange-400 text-sm">
                ⚠️ Si vous téléchargez un nouveau fichier ZIP, il remplacera complètement le code actuel du bot.
              </p>
            </div>
          </div>
        );

      case 'command':
        return <CommandInput command={startCommand} onCommandChange={setStartCommand} />;

      case 'env':
        return (
          <div className="space-y-4">
            <EnvVarEditor envVars={envVars} onEnvVarsChange={setEnvVars} />
            <div className="bg-orange-600/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-orange-400 text-sm">
                ⚠️ Les nouvelles variables d'environnement remplaceront les variables existantes.
              </p>
            </div>
          </div>
        );

      default:
        return null;
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-white text-2xl font-bold">Mettre à jour {bot.name}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Modifiez la configuration de votre bot
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="border-b border-slate-700 bg-slate-800/50 sticky top-[89px] z-10">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[140px] px-6 py-4 text-left border-b-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-transparent hover:bg-slate-700/50'
                    }`}
                  >
                    <p
                      className={`font-medium text-sm ${
                        activeTab === tab.id ? 'text-purple-400' : 'text-slate-400'
                      }`}
                    >
                      {tab.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{tab.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="min-h-[400px]">{renderTabContent()}</div>

              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
