# /path/to/PyDraGo/frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import DiagramList from './components/DiagramList';
import DiagramEditor from './components/DiagramEditor';
import { DiagramService } from './services/DiagramService';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>PyDraGo - Collaborative Diagram Editor</h1>
          <nav>
            <Link to="/">Diagrams</Link>
          </nav>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<DiagramList />} />
            <Route path="/diagram/:id" element={<DiagramEditor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;