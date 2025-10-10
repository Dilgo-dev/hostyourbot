import { FaBolt, FaPaperPlane, FaUserPlus, FaHashtag, FaFilter, FaUserShield, FaCheck } from 'react-icons/fa';

type BlockCategory = 'events' | 'actions' | 'conditions';

interface Block {
  id: string;
  label: string;
  type: 'event' | 'action' | 'condition';
  icon: string;
  category: BlockCategory;
}

const blocks: Block[] = [
  { id: 'onMessageCreate', label: 'Message créé', type: 'event', icon: 'message', category: 'events' },
  { id: 'onReady', label: 'Bot prêt', type: 'event', icon: 'bolt', category: 'events' },
  { id: 'onMemberJoin', label: 'Membre rejoint', type: 'event', icon: 'user', category: 'events' },

  { id: 'sendMessage', label: 'Envoyer message', type: 'action', icon: 'message', category: 'actions' },
  { id: 'addRole', label: 'Ajouter rôle', type: 'action', icon: 'user', category: 'actions' },
  { id: 'createChannel', label: 'Créer salon', type: 'action', icon: 'channel', category: 'actions' },

  { id: 'ifUserHasRole', label: 'Si utilisateur a rôle', type: 'condition', icon: 'filter', category: 'conditions' },
  { id: 'ifMessageContains', label: 'Si message contient', type: 'condition', icon: 'filter', category: 'conditions' },
  { id: 'ifUserIsAdmin', label: 'Si utilisateur est admin', type: 'condition', icon: 'filter', category: 'conditions' },
];

const getBlockIcon = (iconName: string) => {
  switch (iconName) {
    case 'bolt':
      return FaBolt;
    case 'message':
      return FaPaperPlane;
    case 'user':
      return FaUserPlus;
    case 'channel':
      return FaHashtag;
    case 'filter':
      return FaFilter;
    default:
      return FaBolt;
  }
};

const getBlockStyles = (type: 'event' | 'action' | 'condition') => {
  switch (type) {
    case 'event':
      return 'bg-purple-600 hover:bg-purple-700 border-purple-500';
    case 'action':
      return 'bg-blue-600 hover:bg-blue-700 border-blue-500';
    case 'condition':
      return 'bg-amber-600 hover:bg-amber-700 border-amber-500';
  }
};

interface BlocksPaletteProps {
  onDragStart: (event: React.DragEvent, block: Block) => void;
}

export default function BlocksPalette({ onDragStart }: BlocksPaletteProps) {
  const categories: { id: BlockCategory; label: string; icon: typeof FaBolt }[] = [
    { id: 'events', label: 'Événements', icon: FaBolt },
    { id: 'actions', label: 'Actions', icon: FaCheck },
    { id: 'conditions', label: 'Conditions', icon: FaUserShield },
  ];

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-white text-lg font-bold">Blocs Discord</h2>
        <p className="text-slate-400 text-sm mt-1">Glissez les blocs sur le canvas</p>
      </div>

      <div className="p-4 space-y-6">
        {categories.map((category) => {
          const categoryBlocks = blocks.filter(b => b.category === category.id);
          const CategoryIcon = category.icon;

          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-3">
                <CategoryIcon className="text-purple-400 text-sm" />
                <h3 className="text-white text-sm font-semibold uppercase tracking-wide">
                  {category.label}
                </h3>
              </div>

              <div className="space-y-2">
                {categoryBlocks.map((block) => {
                  const Icon = getBlockIcon(block.icon);
                  const styles = getBlockStyles(block.type);

                  return (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, block)}
                      className={`px-3 py-2 rounded-lg border-2 ${styles} text-white cursor-grab active:cursor-grabbing transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="text-sm flex-shrink-0" />
                        <span className="text-sm font-medium">{block.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
