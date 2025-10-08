import { FaPlus, FaTimes } from 'react-icons/fa';
import type { EnvVar } from '../../services/botService';

interface EnvVarEditorProps {
  envVars: EnvVar[];
  onEnvVarsChange: (envVars: EnvVar[]) => void;
}

export default function EnvVarEditor({ envVars, onEnvVarsChange }: EnvVarEditorProps) {
  const addEnvVar = () => {
    onEnvVarsChange([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index: number) => {
    const newEnvVars = envVars.filter((_, i) => i !== index);
    onEnvVarsChange(newEnvVars);
  };

  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const newEnvVars = envVars.map((envVar, i) =>
      i === index ? { ...envVar, [field]: value } : envVar
    );
    onEnvVarsChange(newEnvVars);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-medium">Variables d'environnement</p>
          <p className="text-slate-400 text-sm mt-1">
            Ajoutez les variables nécessaires à votre bot (tokens, clés API, etc.)
          </p>
        </div>
        <button
          type="button"
          onClick={addEnvVar}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          <FaPlus className="text-sm" />
          Ajouter
        </button>
      </div>

      {envVars.length === 0 ? (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-500">Aucune variable d'environnement ajoutée</p>
          <p className="text-slate-600 text-sm mt-1">
            Cliquez sur "Ajouter" pour créer une nouvelle variable
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {envVars.map((envVar, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center gap-3"
            >
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={envVar.key}
                  onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                  placeholder="CLÉ"
                  className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-500 font-mono text-sm"
                />
                <input
                  type="text"
                  value={envVar.value}
                  onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                  placeholder="valeur"
                  className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-500 font-mono text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeEnvVar(index)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          ))}
        </div>
      )}

      {envVars.length > 0 && (
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm">
            💡 Les variables d'environnement seront stockées de manière sécurisée et ne seront pas visibles après le déploiement
          </p>
        </div>
      )}
    </div>
  );
}
