import React from 'react';
import Dashboard from './components/Dashboard';
import './styles/styles.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NWU Collaborative Documentation</h1>
      </header>
      <Dashboard />
    </div>
  );
}

export default App;
