import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaList, FaFileAlt } from 'react-icons/fa';
import type { EnvVar } from '../../services/botService';

interface EnvVarEditorProps {
  envVars: EnvVar[];
  onEnvVarsChange: (envVars: EnvVar[]) => void;
}

export default function EnvVarEditor({ envVars, onEnvVarsChange }: EnvVarEditorProps) {
  const [mode, setMode] = useState<'key-value' | 'text'>('key-value');
  const [textValue, setTextValue] = useState('');

  useEffect(() => {
    if (mode === 'text') {
      setTextValue(envVarsToText(envVars));
    }
  }, [envVars, mode]);

  const parseEnvText = (text: string): EnvVar[] => {
    return text
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        if (index === -1) return null;
        return {
          key: line.substring(0, index).trim(),
          value: line.substring(index + 1).trim(),
        };
      })
      .filter(Boolean) as EnvVar[];
  };

  const envVarsToText = (vars: EnvVar[]): string => {
    return vars
      .filter((v) => v.key && v.value)
      .map((v) => `${v.key}=${v.value}`)
      .join('\n');
  };

  const switchMode = (newMode: 'key-value' | 'text') => {
    if (newMode === 'text') {
      setTextValue(envVarsToText(envVars));
    } else {
      const parsed = parseEnvText(textValue);
      onEnvVarsChange(parsed);
    }
    setMode(newMode);
  };

  const handleTextChange = (text: string) => {
    setTextValue(text);
    const parsed = parseEnvText(text);
    onEnvVarsChange(parsed);
  };

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
            {mode === 'key-value'
              ? 'Ajoutez vos variables une par une ou passez en mode texte'
              : 'Collez le contenu de votre fichier .env'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => switchMode('key-value')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'key-value'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <FaList className="text-sm" />
            <span className="hidden sm:inline">Clé-valeur</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'text'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <FaFileAlt className="text-sm" />
            <span className="hidden sm:inline">Texte</span>
          </button>
        </div>
      </div>

      {mode === 'key-value' ? (
        <>
          <div className="flex justify-end mb-3">
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
        </>
      ) : (
        <div className="space-y-3">
          <textarea
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="DISCORD_TOKEN=abc123456789&#10;API_KEY=xyz987654321&#10;DATABASE_URL=postgres://localhost:5432/db&#10;PORT=3000"
            className="w-full h-64 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm resize-none"
            spellCheck={false}
          />
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              💡 Format: CLÉ=valeur (une variable par ligne). Les commentaires (#) et lignes vides
              sont ignorés.
            </p>
          </div>
        </div>
      )}

      {envVars.length > 0 && mode === 'key-value' && (
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm">
            💡 Les variables d'environnement seront stockées de manière sécurisée et ne seront pas
            visibles après le déploiement
          </p>
        </div>
      )}
    </div>
  );
}
