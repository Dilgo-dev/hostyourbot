import { motion } from 'framer-motion';
import { FaEdit, FaProjectDiagram } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { Bot } from '../../services/botService';

interface BotWorkflowProps {
  bot: Bot;
}

export default function BotWorkflow({ bot }: BotWorkflowProps) {
  const navigate = useNavigate();

  if (!bot.workflowId) {
    return null;
  }

  const handleEditWorkflow = () => {
    navigate(`/builder?workflowId=${bot.workflowId}&mode=edit`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600/10 rounded-lg flex items-center justify-center">
            <FaProjectDiagram className="text-purple-400 text-xl" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Workflow</h2>
            <p className="text-sm text-slate-400">
              Ce bot a été généré à partir d'un workflow visuel
            </p>
          </div>
        </div>

        <button
          onClick={handleEditWorkflow}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 rounded-lg transition-all duration-200 border border-purple-600/20 hover:border-purple-600/40"
        >
          <FaEdit />
          Modifier le workflow
        </button>
      </div>
    </motion.div>
  );
}
