import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { builderService } from '../services/builderService';
import { useAuth } from '../context/AuthContext';

const nodeTypes = {
  custom: CustomNode,
};

let id = 0;
const getId = () => `node_${id++}`;

export default function Builder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDeployMode = searchParams.get('mode') === 'deploy';
  const isEditMode = searchParams.get('mode') === 'edit';
  const workflowIdParam = searchParams.get('workflowId');

  useEffect(() => {
    if (workflowIdParam && user && (isEditMode || isDeployMode)) {
      loadWorkflow(workflowIdParam);
    }
  }, [workflowIdParam, user, isEditMode, isDeployMode]);

  const loadWorkflow = async (id: string) => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const workflow = await builderService.getWorkflow(id, user.id);
      setWorkflowName(workflow.name);
      setCurrentWorkflowId(workflow._id || null);
      setNodes(workflow.nodes);
      setEdges(workflow.edges);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du workflow');
    } finally {
      setSaving(false);
    }
  };

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

  const handleSave = async () => {
    if (!user) return;

    if (!workflowName.trim()) {
      const name = prompt('Nom du workflow :');
      if (!name) return;
      setWorkflowName(name);
    }

    setSaving(true);
    setError(null);

    try {
      if (currentWorkflowId) {
        await builderService.updateWorkflow(currentWorkflowId, user.id, {
          name: workflowName,
          nodes,
          edges,
        });
      } else {
        const workflow = await builderService.createWorkflow({
          name: workflowName,
          userId: user.id,
          nodes,
          edges,
          botType: 'discord',
        });
        setCurrentWorkflowId(workflow._id || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAndDeploy = async () => {
    if (!user) return;

    if (nodes.length === 0) {
      setError('Ajoutez des blocs avant de générer');
      return;
    }

    const eventNodes = nodes.filter(n => n.data.type === 'event');
    if (eventNodes.length === 0) {
      setError('Ajoutez au moins un événement (bloc violet)');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      let workflowId = currentWorkflowId;

      if (!workflowId) {
        if (!workflowName.trim()) {
          const name = prompt('Nom du workflow :');
          if (!name) {
            setGenerating(false);
            return;
          }
          setWorkflowName(name);
        }

        const workflow = await builderService.createWorkflow({
          name: workflowName || 'Bot Discord',
          userId: user.id,
          nodes,
          edges,
          botType: 'discord',
        });
        workflowId = workflow._id || null;
        setCurrentWorkflowId(workflowId);
      } else {
        await builderService.updateWorkflow(workflowId, user.id, {
          name: workflowName,
          nodes,
          edges,
        });
      }

      const zipBlob = await builderService.generateDirect({
        nodes,
        edges,
      });

      const file = new File([zipBlob], 'discord-bot.zip', { type: 'application/zip' });

      navigate('/dashboard/create', {
        state: {
          generatedZip: file,
          fromBuilder: true,
          workflowId,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération');
      setGenerating(false);
    }
  };

  const handleGenerateAndDownload = async () => {
    if (!user) return;

    if (nodes.length === 0) {
      setError('Ajoutez des blocs avant de générer');
      return;
    }

    const eventNodes = nodes.filter(n => n.data.type === 'event');
    if (eventNodes.length === 0) {
      setError('Ajoutez au moins un événement (bloc violet)');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const zipBlob = await builderService.generateDirect({
        nodes,
        edges,
      });

      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'discord-bot.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <BuilderToolbar
        onClear={handleClear}
        onSave={isDeployMode ? handleSave : undefined}
        onGenerate={isDeployMode ? handleGenerateAndDeploy : undefined}
        onGenerateDownload={isDeployMode ? handleGenerateAndDownload : undefined}
        saving={saving}
        generating={generating}
        isAdmin={user?.role === 'admin'}
      />

      {error && (
        <div className="bg-red-600/20 border-b border-red-500/30 text-red-400 px-6 py-3 text-sm">
          {error}
        </div>
      )}

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
