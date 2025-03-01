# /path/to/PyDraGo/frontend/src/components/nodes/CustomNode.tsx
import React, { useState, useCallback, memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import './CustomNode.css';

interface CustomNodeData {
  label: string;
  type: string;
  content?: string;
  metadata?: Record<string, any>;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({
  id,
  data,
  isConnectable,
  selected
}) => {
  const [nodeName, setNodeName] = useState(data.label || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeName(e.target.value);
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    // Here we would normally update the node data in Yjs
    // This will be handled by the parent DiagramEditor component
  }, []);

  const getNodeClassNames = () => {
    const classes = ['custom-node'];

    if (selected) {
      classes.push('selected');
    }

    if (data.type === 'conditional') {
      classes.push('conditional-node');
    } else if (data.type === 'response') {
      classes.push('response-node');
    }

    return classes.join(' ');
  };

  return (
    <div className={getNodeClassNames()}>
      {data.type === 'conditional' && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
      )}

      <div className="node-header">
        {isEditing ? (
          <input
            type="text"
            value={nodeName}
            onChange={handleNameChange}
            onBlur={stopEditing}
            onKeyDown={(e) => e.key === 'Enter' && stopEditing()}
            autoFocus
          />
        ) : (
          <div className="node-title" onClick={startEditing}>
            {nodeName}
          </div>
        )}
      </div>

      <div className="node-content">
        {data.content || 'Click to edit node'}
      </div>

      {data.type === 'conditional' && (
        <>
          <Handle
            id="source-right"
            type="source"
            position={Position.Right}
            isConnectable={isConnectable}
            style={{ top: '40%' }}
          />
          <Handle
            id="source-left"
            type="source"
            position={Position.Left}
            isConnectable={isConnectable}
            style={{ top: '40%' }}
          />
        </>
      )}

      {data.type === 'response' && (
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
      )}
    </div>
  );
};

export default memo(CustomNode);