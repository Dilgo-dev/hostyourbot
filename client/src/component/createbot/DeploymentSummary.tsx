import { FaNodeJs, FaPython, FaFileArchive, FaKey, FaTerminal } from 'react-icons/fa';
import { SiGo, SiRust } from 'react-icons/si';
import type { EnvVar } from '../../services/botService';

interface DeploymentSummaryProps {
  name: string;
  language: string;
  version: string;
  zipFile: File | null;
  startCommand?: string;
  envVars: EnvVar[];
}

export default function DeploymentSummary({
  name,
  language,
  version,
  zipFile,
  startCommand,
  envVars,
}: DeploymentSummaryProps) {
  const getLanguageIcon = () => {
    switch (language) {
      case 'nodejs':
        return <FaNodeJs className="text-2xl text-green-400" />;
      case 'python':
        return <FaPython className="text-2xl text-blue-400" />;
      case 'go':
        return <SiGo className="text-2xl text-cyan-400" />;
      case 'rust':
        return <SiRust className="text-2xl text-orange-400" />;
      default:
        return null;
    }
  };

  const getLanguageName = () => {
    switch (language) {
      case 'nodejs':
        return 'Node.js';
      case 'python':
        return 'Python';
      case 'go':
        return 'Go';
      case 'rust':
        return 'Rust';
      default:
        return language;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4">
        <p className="text-purple-300 font-medium">
          Vérifiez les informations avant de déployer votre bot
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
        <div>
          <p className="text-slate-400 text-sm mb-2">Nom du bot</p>
          <p className="text-white text-xl font-bold">{name}</p>
        </div>

        <div className="border-t border-slate-700 pt-6">
          <p className="text-slate-400 text-sm mb-3">Environnement</p>
          <div className="flex items-center gap-4 bg-slate-800 rounded-lg p-4">
            {getLanguageIcon()}
            <div>
              <p className="text-white font-medium">{getLanguageName()}</p>
              <p className="text-slate-400 text-sm">Version {version}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <FaFileArchive className="text-slate-400" />
            <p className="text-slate-400 text-sm">Archive du projet</p>
          </div>
          {zipFile ? (
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FaFileArchive className="text-purple-400 text-xl" />
                <div className="flex-1">
                  <p className="text-white text-sm">{zipFile.name}</p>
                  <p className="text-slate-500 text-xs">{formatFileSize(zipFile.size)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Aucun fichier</p>
          )}
        </div>

        {startCommand && (
          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <FaTerminal className="text-slate-400" />
              <p className="text-slate-400 text-sm">Commande de démarrage</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-purple-400 font-mono text-sm">{startCommand}</p>
            </div>
          </div>
        )}

        <div className="border-t border-slate-700 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <FaKey className="text-slate-400" />
            <p className="text-slate-400 text-sm">
              Variables d'environnement ({envVars.filter((v) => v.key && v.value).length})
            </p>
          </div>
          {envVars.filter((v) => v.key && v.value).length > 0 ? (
            <div className="bg-slate-800 rounded-lg p-4 space-y-2">
              {envVars
                .filter((v) => v.key && v.value)
                .map((envVar, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <p className="text-purple-400 text-sm font-mono">{envVar.key}</p>
                    <p className="text-slate-600 text-sm">••••••••</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Aucune variable</p>
          )}
        </div>
      </div>
    </div>
  );
}
