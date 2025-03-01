# /path/to/PyDraGo/frontend/src/components/DiagramEditor.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
  EdgeTypes,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { YjsProvider, YjsSync } from '../services/YjsProvider';
import { Diagram, DiagramService } from '../services/DiagramService';
import useUndoRedo from '../hooks/useUndoRedo';
import './DiagramEditor.css';
import CustomNode from './nodes/CustomNode';
import CustomEdge from './edges/CustomEdge';

// Define custom node and edge types
const nodeTypes: NodeTypes = {
  customNode: CustomNode,
};

const edgeTypes: EdgeTypes = {
  customEdge: CustomEdge,
};

const DiagramEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [diagram, setDiagram] = useState<Diagram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ReactFlow states
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  // Yjs sync ref to keep it stable across renders
  const yjsSyncRef = useRef<YjsSync | null>(null);

  // Track whether we've already loaded the initial state
  const initialStateLoadedRef = useRef(false);

  // Undo/Redo functionality
  const { undo, redo, canUndo, canRedo, takeSnapshot } = useUndoRedo(yjsSyncRef.current?.doc);

  useEffect(() => {
    if (!id) return;

    // Load diagram metadata
    const loadDiagram = async () => {
      try {
        setLoading(true);
        const fetchedDiagram = await DiagramService.getDiagram(id);
        setDiagram(fetchedDiagram);
        setError(null);
      } catch (err) {
        setError('Failed to load diagram');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDiagram();

    // Set up Yjs connection
    yjsSyncRef.current = YjsProvider.connect(id);
    const { nodes: yNodes, edges: yEdges } = yjsSyncRef.current;

    // Handle Yjs nodes updates
    const nodesObserver = () => {
      if (!initialStateLoadedRef.current) return;

      const newNodes = yNodes.toArray();
      setNodes(newNodes);
    };
    yNodes.observe(nodesObserver);

    // Handle Yjs edges updates
    const edgesObserver = () => {
      if (!initialStateLoadedRef.current) return;

      const newEdges = yEdges.toArray();
      setEdges(newEdges);
    };
    yEdges.observe(edgesObserver);

    // Initial data load from Yjs
    if (yNodes.length > 0 || yEdges.length > 0) {
      setNodes(yNodes.toArray());
      setEdges(yEdges.toArray());
      initialStateLoadedRef.current = true;
    } else if (fetchedDiagram?.json_data) {
      // Fallback to JSON data if Yjs data is empty
      const { nodes: jsonNodes = [], edges: jsonEdges = [] } = fetchedDiagram.json_data;

      // Sync from JSON to Yjs
      yNodes.push(jsonNodes);
      yEdges.push(jsonEdges);

      // Update local state
      setNodes(jsonNodes);
      setEdges(jsonEdges);
      initialStateLoadedRef.current = true;
    }

    return () => {
      // Clean up Yjs connection
      yjsSyncRef.current?.disconnect();
      yjsSyncRef.current = null;
    };
  }, [id]);

  // Handle connections between nodes
  const onConnect: OnConnect = useCallback((connection: Connection) => {
    if (!yjsSyncRef.current) return;

    const { nodes: yNodes, edges: yEdges } = yjsSyncRef.current;
    const newEdge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}`,
      type: 'customEdge',
    };

    // Add edge to Yjs
    yEdges.push([newEdge]);

    // Take undo/redo snapshot
    takeSnapshot();
  }, [takeSnapshot]);

  // Handle node changes from ReactFlow
  const handleNodesChange: OnNodesChange = useCallback((changes) => {
    if (!initialStateLoadedRef.current || !yjsSyncRef.current) {
      onNodesChange(changes);
      return;
    }

    // Process changes and apply to Yjs
    const { nodes: yNodes } = yjsSyncRef.current;

    // Apply changes locally first (for immediate UI feedback)
    onNodesChange(changes);

    // Then sync changes to Yjs
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        // Find node index in Yjs array
        const nodeIndex = yNodes.toArray().findIndex(n => n.id === change.id);
        if (nodeIndex !== -1) {
          // Update position in Yjs
          const updatedNode = {...yNodes.get(nodeIndex), position: change.position};
          yNodes.delete(nodeIndex, 1);
          yNodes.insert(nodeIndex, [updatedNode]);
        }
      } else if (change.type === 'remove') {
        // Handle node removal
        const nodeIndex = yNodes.toArray().findIndex(n => n.id === change.id);
        if (nodeIndex !== -1) {
          yNodes.delete(nodeIndex, 1);
        }
      }
    });

    // Take undo/redo snapshot after batch of changes
    takeSnapshot();
  }, [onNodesChange, takeSnapshot]);

  // Handle edge changes from ReactFlow
  const handleEdgesChange: OnEdgesChange = useCallback((changes) => {
    if (!initialStateLoadedRef.current || !yjsSyncRef.current) {
      onEdgesChange(changes);
      return;
    }

    // Process changes and apply to Yjs
    const { edges: yEdges } = yjsSyncRef.current;

    // Apply changes locally first (for immediate UI feedback)
    onEdgesChange(changes);

    // Then sync changes to Yjs
    changes.forEach(change => {
      if (change.type === 'remove') {
        // Handle edge removal
        const edgeIndex = yEdges.toArray().findIndex(e => e.id === change.id);
        if (edgeIndex !== -1) {
          yEdges.delete(edgeIndex, 1);
        }
      }
    });

    // Take undo/redo snapshot after batch of changes
    takeSnapshot();
  }, [onEdgesChange, takeSnapshot]);

  // Handle node addition
  const handleAddNode = useCallback((type: string, position: { x: number, y: number }) => {
    if (!yjsSyncRef.current) return;

    const { nodes: yNodes } = yjsSyncRef.current;
    const newNodeId = `node-${Date.now()}`;

    const newNode: Node = {
      id: newNodeId,
      type: 'customNode',
      position,
      data: { label: `${type} Node`, type },
    };

    // Add to Yjs
    yNodes.push([newNode]);

    // Take undo/redo snapshot
    takeSnapshot();
  }, [takeSnapshot]);

  // Save the current diagram
  const handleSave = useCallback(async () => {
    if (!id || !diagram) return;

    try {
      const currentNodes = nodes;
      const currentEdges = edges;

      const jsonData = {
        nodes: currentNodes,
        edges: currentEdges,
      };

      await DiagramService.updateDiagram(id, {
        ...diagram,
        json_data: jsonData,
      });

      alert('Diagram saved successfully!');
    } catch (err) {
      console.error('Failed to save diagram:', err);
      alert('Failed to save diagram. Please try again.');
    }
  }, [id, diagram, nodes, edges]);

  if (loading) return <div className="loading">Loading diagram...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!diagram) return <div className="error">Diagram not found</div>;

  return (
    <div className="diagram-editor">
      <div className="editor-header">
        <h2>{diagram.name}</h2>
        <div className="editor-controls">
          <button onClick={() => navigate('/')}>Back to List</button>
          <button onClick={handleSave}>Save</button>
          <button onClick={undo} disabled={!canUndo}>Undo</button>
          <button onClick={redo} disabled={!canRedo}>Redo</button>
        </div>
      </div>

      <div className="editor-sidebar">
        <h3>Add Nodes</h3>
        <div className="node-buttons">
          <button
            onClick={() =>
              handleAddNode('conditional', {
                x: 100,
                y: 100 + Math.random() * 100,
              })
            }
          >
            Add Condition
          </button>
          <button
            onClick={() =>
              handleAddNode('response', {
                x: 100,
                y: 250 + Math.random() * 100,
              })
            }
          >
            Add Response
          </button>
        </div>
      </div>

      <div className="editor-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};

export default DiagramEditor;