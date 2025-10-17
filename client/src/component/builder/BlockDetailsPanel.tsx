import { FaTimes, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import type { Node } from '@xyflow/react';
import type { NodeData, NodeConfig } from '../../services/builderService';

interface BlockDetailsPanelProps {
  node: Node<NodeData> | null;
  onClose: () => void;
  onUpdate: (nodeId: string, config: NodeConfig) => void;
  onDelete: (nodeId: string) => void;
}

export default function BlockDetailsPanel({ node, onClose, onUpdate, onDelete }: BlockDetailsPanelProps) {
  if (!node) return null;

  const handleConfigChange = (key: string, value: string) => {
    const newConfig = { ...node.data.config, [key]: value };
    onUpdate(node.id, newConfig);
  };

  const renderConfigFields = () => {
    switch (node.data.blockId) {
      case 'onMessageCreate':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Commande spécifique (optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: !help, !ping"
                value={node.data.config?.command || ''}
                onChange={(e) => handleConfigChange('command', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Si vide, déclenché pour tous les messages
              </p>
            </div>
          </div>
        );

      case 'onReady':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Cet événement se déclenche lorsque le bot est prêt et connecté à Discord.
            </p>
          </div>
        );

      case 'onMemberJoin':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Cet événement se déclenche lorsqu'un membre rejoint le serveur.
            </p>
          </div>
        );

      case 'sendMessage':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contenu du message *
              </label>
              <textarea
                placeholder="Tapez votre message ici..."
                value={node.data.config?.messageContent || ''}
                onChange={(e) => handleConfigChange('messageContent', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ID du salon (optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: 123456789012345678"
                value={node.data.config?.channelId || ''}
                onChange={(e) => handleConfigChange('channelId', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Si vide, envoie dans le salon actuel
              </p>
            </div>
          </div>
        );

      case 'addRole':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ID du rôle *
              </label>
              <input
                type="text"
                placeholder="Ex: 123456789012345678"
                value={node.data.config?.roleId || ''}
                onChange={(e) => handleConfigChange('roleId', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nom du rôle (optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: Membre"
                value={node.data.config?.roleName || ''}
                onChange={(e) => handleConfigChange('roleName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        );

      case 'createChannel':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nom du salon *
              </label>
              <input
                type="text"
                placeholder="Ex: nouveau-salon"
                value={node.data.config?.channelName || ''}
                onChange={(e) => handleConfigChange('channelName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        );

      case 'ifUserHasRole':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ID du rôle *
              </label>
              <input
                type="text"
                placeholder="Ex: 123456789012345678"
                value={node.data.config?.roleId || ''}
                onChange={(e) => handleConfigChange('roleId', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        );

      case 'ifMessageContains':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Texte à détecter *
              </label>
              <input
                type="text"
                placeholder="Ex: bonjour, merci"
                value={node.data.config?.triggerText || ''}
                onChange={(e) => handleConfigChange('triggerText', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-amber-500 focus:outline-none"
              />
              <p className="text-xs text-slate-400 mt-1">
                Non sensible à la casse
              </p>
            </div>
          </div>
        );

      case 'ifUserIsAdmin':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Cette condition vérifie si l'utilisateur a les permissions d'administrateur.
            </p>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Aucune configuration disponible pour ce bloc.
            </p>
          </div>
        );
    }
  };

  const getTypeColor = () => {
    switch (node.data.type) {
      case 'event':
        return 'text-purple-400';
      case 'action':
        return 'text-blue-400';
      case 'condition':
        return 'text-amber-400';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        exit={{ x: 320 }}
        transition={{ duration: 0.3 }}
        className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col"
      >
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">{node.data.label}</h3>
            <p className={`text-sm capitalize ${getTypeColor()}`}>{node.data.type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3">Configuration</h4>
            {renderConfigFields()}
          </div>
        </div>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => onDelete(node.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
          >
            <FaTrash />
            <span className="font-medium">Supprimer le bloc</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
