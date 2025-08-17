import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const user = localStorage.getItem('user');

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Project Collaboration Portal</h1>
          {user && (
            <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}>
              Logout
            </button>
          )}
        </header>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
