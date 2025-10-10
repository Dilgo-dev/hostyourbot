import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import BuilderToolbar from '../component/builder/BuilderToolbar';
import BlocksPalette from '../component/builder/BlocksPalette';
import BlockDetailsPanel from '../component/builder/BlockDetailsPanel';
import CustomNode, { type NodeData, type NodeConfig } from '../component/builder/CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

let id = 0;
const getId = () => `node_${id++}`;

export default function Builder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const blockData = event.dataTransfer.getData('application/reactflow');
      if (!blockData) return;

      const block = JSON.parse(blockData);
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node<NodeData> = {
        id: getId(),
        type: 'custom',
        position,
        data: {
          label: block.label,
          type: block.type,
          icon: block.icon,
          blockId: block.id,
          config: {},
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = (event: React.DragEvent, block: any) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(block));
  };

  const handleClear = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer tous les blocs ?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
    }
  };

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleUpdateNodeConfig = useCallback((nodeId: string, config: NodeConfig) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config,
            },
          };
        }
        return node;
      })
    );

    setSelectedNode((prev) => {
      if (prev && prev.id === nodeId) {
        return {
          ...prev,
          data: {
            ...prev.data,
            config,
          },
        };
      }
      return prev;
    });
  }, [setNodes]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <BuilderToolbar onClear={handleClear} />

      <div className="flex-1 flex overflow-hidden">
        <BlocksPalette onDragStart={onDragStart} />

        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-900"
          >
            <Controls className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden" />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#475569"
              className="bg-slate-900"
            />
          </ReactFlow>
        </div>

        {selectedNode && (
          <BlockDetailsPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={handleUpdateNodeConfig}
            onDelete={handleDeleteNode}
          />
        )}
      </div>
    </div>
  );
}
