import { motion } from 'framer-motion';
import { FaRedo, FaTerminal } from 'react-icons/fa';

interface BotLogsProps {
  logs: string[];
  loading: boolean;
  onRefresh: () => void;
}

export default function BotLogs({ logs, loading, onRefresh }: BotLogsProps) {
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
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaRedo className={loading ? 'animate-spin text-xs' : 'text-xs'} />
          Actualiser
        </button>
      </div>

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
