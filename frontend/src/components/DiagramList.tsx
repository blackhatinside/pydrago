# /path/to/PyDraGo/frontend/src/components/DiagramList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Diagram, DiagramService } from '../services/DiagramService';
import './DiagramList.css';

const DiagramList: React.FC = () => {
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newDiagramName, setNewDiagramName] = useState('');
  const [newDiagramDescription, setNewDiagramDescription] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadDiagrams();
  }, []);

  const loadDiagrams = async () => {
    try {
      setLoading(true);
      const fetchedDiagrams = await DiagramService.getAllDiagrams();
      setDiagrams(fetchedDiagrams);
      setError(null);
    } catch (err) {
      setError('Failed to load diagrams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiagram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagramName.trim()) return;

    try {
      const newDiagram = await DiagramService.createDiagram({
        name: newDiagramName,
        description: newDiagramDescription,
      });

      setDiagrams([...diagrams, newDiagram]);
      setNewDiagramName('');
      setNewDiagramDescription('');
    } catch (err) {
      setError('Failed to create diagram');
      console.error(err);
    }
  };

  const handleDeleteDiagram = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this diagram?')) return;

    try {
      await DiagramService.deleteDiagram(id);
      setDiagrams(diagrams.filter(diagram => diagram.id !== id));
    } catch (err) {
      setError('Failed to delete diagram');
      console.error(err);
    }
  };

  const handleOpenDiagram = (id: string) => {
    navigate(`/diagram/${id}`);
  };

  if (loading) return <div className="loading">Loading diagrams...</div>;

  return (
    <div className="diagram-list-container">
      <h2>Your Diagrams</h2>

      {error && <div className="error-message">{error}</div>}

      <form className="create-diagram-form" onSubmit={handleCreateDiagram}>
        <h3>Create New Diagram</h3>
        <div className="form-group">
          <label htmlFor="diagramName">Name:</label>
          <input
            id="diagramName"
            type="text"
            value={newDiagramName}
            onChange={e => setNewDiagramName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="diagramDescription">Description:</label>
          <textarea
            id="diagramDescription"
            value={newDiagramDescription}
            onChange={e => setNewDiagramDescription(e.target.value)}
          />
        </div>
        <button type="submit">Create Diagram</button>
      </form>

      <div className="diagrams-grid">
        {diagrams.length === 0 ? (
          <p>No diagrams found. Create one to get started!</p>
        ) : (
          diagrams.map(diagram => (
            <div key={diagram.id} className="diagram-card">
              <h3>{diagram.name}</h3>
              <p>{diagram.description}</p>
              <div className="card-footer">
                <span>Created: {new Date(diagram.created_at).toLocaleDateString()}</span>
                <div className="card-actions">
                  <button onClick={() => handleOpenDiagram(diagram.id)}>Open</button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteDiagram(diagram.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiagramList;