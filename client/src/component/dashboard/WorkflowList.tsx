import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaDownload, FaClock } from 'react-icons/fa';
import type { Workflow } from '../../services/builderService';

interface WorkflowListProps {
  workflows: Workflow[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export default function WorkflowList({
  workflows,
  loading = false,
  onEdit,
  onDelete,
  onDownload
}: WorkflowListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse"
          >
            <div className="h-5 bg-slate-700 rounded w-3/4 mb-3" />
            <div className="h-4 bg-slate-700 rounded w-full mb-4" />
            <div className="flex gap-2">
              <div className="h-9 bg-slate-700 rounded flex-1" />
              <div className="h-9 bg-slate-700 rounded w-9" />
              <div className="h-9 bg-slate-700 rounded w-9" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center"
      >
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-purple-600/20 border border-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Aucun workflow pour le moment</h3>
          <p className="text-slate-400 mb-6">
            Créez votre premier workflow pour automatiser votre bot
          </p>
        </div>
      </motion.div>
    );
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workflows.map((workflow, index) => (
        <motion.div
          key={workflow._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-200"
        >
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-2 truncate">
              {workflow.name}
            </h3>
            {workflow.description && (
              <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                {workflow.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <FaClock />
              <span>Modifié le {formatDate(workflow.updatedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
            <span className="bg-slate-700 px-2 py-1 rounded">
              {workflow.nodes.length} blocs
            </span>
            <span className="bg-slate-700 px-2 py-1 rounded">
              {workflow.edges.length} connexions
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(workflow._id!)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/50"
            >
              <FaEdit />
              Éditer
            </button>
            <button
              onClick={() => onDownload(workflow._id!)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              <FaDownload />
            </button>
            <button
              onClick={() => onDelete(workflow._id!)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors"
            >
              <FaTrash />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
