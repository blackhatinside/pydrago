# /path/to/PyDraGo/frontend/src/components/edges/CustomEdge.tsx
import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import './CustomEdge.css';

interface CustomEdgeData {
  label?: string;
  type?: string;
}

const CustomEdge: React.FC<EdgeProps<CustomEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style = {},
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeType = data?.type || 'default';

  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path custom-edge ${edgeType}-edge`}
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />

      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className="custom-edge-label"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;