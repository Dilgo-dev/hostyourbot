import { motion } from 'framer-motion';
import { FaRedo, FaTerminal } from 'react-icons/fa';
import { useState } from 'react';

interface BotLogsProps {
  logs: string[];
  loading: boolean;
  onRefresh: () => void;
  isAdmin?: boolean;
  onExecCommand?: (command: string) => Promise<{ output: string; error?: string }>;
}

export default function BotLogs({ logs, loading, onRefresh, isAdmin, onExecCommand }: BotLogsProps) {
  const [showTerminal, setShowTerminal] = useState(false);
  const [command, setCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState<string[]>([]);
  const [executing, setExecuting] = useState(false);

  const handleExecuteCommand = async () => {
    if (!command.trim() || !onExecCommand) return;

    setExecuting(true);
    try {
      const result = await onExecCommand(command);
      const timestamp = new Date().toLocaleTimeString();

      if (result.error) {
        setCommandOutput(prev => [
          ...prev,
          `[${timestamp}] $ ${command}`,
          `Erreur: ${result.error}`,
          result.output || '',
        ]);
      } else {
        setCommandOutput(prev => [
          ...prev,
          `[${timestamp}] $ ${command}`,
          result.output || 'Commande exécutée avec succès',
        ]);
      }
      setCommand('');
    } catch (error: any) {
      const timestamp = new Date().toLocaleTimeString();
      setCommandOutput(prev => [
        ...prev,
        `[${timestamp}] $ ${command}`,
        `Erreur: ${error.message || 'Échec de l\'exécution de la commande'}`,
      ]);
    } finally {
      setExecuting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !executing) {
      handleExecuteCommand();
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <FaTerminal className="text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Logs</h2>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showTerminal
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              <FaTerminal className="text-xs" />
              Terminal
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaRedo className={loading ? 'animate-spin text-xs' : 'text-xs'} />
            Actualiser
          </button>
        </div>
      </div>

      {showTerminal && isAdmin && (
        <div className="border-b border-slate-700 bg-slate-900/70 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-mono text-sm">$</span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={executing}
                placeholder="Entrez une commande..."
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-purple-400 disabled:opacity-50"
              />
              <button
                onClick={handleExecuteCommand}
                disabled={executing || !command.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {executing ? 'Exécution...' : 'Exécuter'}
              </button>
            </div>
            {commandOutput.length > 0 && (
              <div className="bg-slate-950/50 border border-slate-700 rounded p-3 max-h-48 overflow-y-auto">
                <div className="space-y-1">
                  {commandOutput.map((line, index) => (
                    <div
                      key={index}
                      className={`font-mono text-xs ${
                        line.startsWith('Erreur:') ? 'text-red-400' :
                        line.startsWith('[') ? 'text-purple-300' :
                        'text-slate-300'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 bg-slate-900/50 max-h-96 overflow-y-auto font-mono text-sm">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Aucun log disponible
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className="text-slate-300 hover:bg-slate-800/50 px-2 py-1 rounded transition-colors"
              >
                <span className="text-slate-500 select-none mr-3">{index + 1}</span>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
