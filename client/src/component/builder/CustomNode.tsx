import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FaBolt, FaPaperPlane, FaUserPlus, FaHashtag, FaFilter } from 'react-icons/fa';

export type NodeData = {
  label: string;
  type: 'event' | 'action' | 'condition';
  icon?: string;
};

const getNodeIcon = (iconName?: string) => {
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

const getNodeStyles = (type: 'event' | 'action' | 'condition') => {
  switch (type) {
    case 'event':
      return 'bg-purple-600 border-purple-500';
    case 'action':
      return 'bg-blue-600 border-blue-500';
    case 'condition':
      return 'bg-amber-600 border-amber-500';
  }
};

function CustomNode({ data }: NodeProps<NodeData>) {
  const Icon = getNodeIcon(data.icon);
  const styles = getNodeStyles(data.type);

  return (
    <div className={`px-4 py-3 rounded-lg border-2 ${styles} text-white min-w-[180px] shadow-lg`}>
      {data.type !== 'event' && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-slate-300 border-2 border-slate-600"
        />
      )}

      <div className="flex items-center gap-3">
        <Icon className="text-lg flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{data.label}</p>
          <p className="text-xs opacity-80 capitalize">{data.type}</p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-slate-300 border-2 border-slate-600"
      />
    </div>
  );
}

export default memo(CustomNode);
