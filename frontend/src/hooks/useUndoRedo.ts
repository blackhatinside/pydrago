# /path/to/PyDraGo/frontend/src/hooks/useUndoRedo.ts
import { useState, useCallback, useEffect } from 'react';
import * as Y from 'yjs';

interface UndoRedoHook {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  takeSnapshot: () => void;
}

const useUndoRedo = (doc: Y.Doc | null | undefined): UndoRedoHook => {
  const [undoManager, setUndoManager] = useState<Y.UndoManager | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Initialize UndoManager when doc is available
  useEffect(() => {
    if (!doc) return;

    // Create UndoManager with the diagram shared type
    const diagramMap = doc.getMap('diagram');
    const newUndoManager = new Y.UndoManager(diagramMap, {
      // Configuration options
      captureTimeout: 500, // Time window to merge changes
    });

    // Update state when undo/redo status changes
    const updateStatus = () => {
      setCanUndo(newUndoManager.canUndo());
      setCanRedo(newUndoManager.canRedo());
    };

    // Listen for stack changes
    newUndoManager.on('stack-item-added', updateStatus);
    newUndoManager.on('stack-item-popped', updateStatus);
    newUndoManager.on('stack-cleared', updateStatus);

    // Initial status
    updateStatus();

    setUndoManager(newUndoManager);

    return () => {
      // Remove listeners
      newUndoManager.off('stack-item-added', updateStatus);
      newUndoManager.off('stack-item-popped', updateStatus);
      newUndoManager.off('stack-cleared', updateStatus);
      newUndoManager.destroy();
    };
  }, [doc]);

  // Undo function
  const undo = useCallback(() => {
    if (undoManager && undoManager.canUndo()) {
      undoManager.undo();
    }
  }, [undoManager]);

  // Redo function
  const redo = useCallback(() => {
    if (undoManager && undoManager.canRedo()) {
      undoManager.redo();
    }
  }, [undoManager]);

  // Take snapshot to support undo
  const takeSnapshot = useCallback(() => {
    if (undoManager) {
      // This will force a new undo stack item in case of changes in progress
      undoManager.stopCapturing();
    }
  }, [undoManager]);

  return { undo, redo, canUndo, canRedo, takeSnapshot };
};

export default useUndoRedo;