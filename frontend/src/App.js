import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import Calendar from './components/Calendar';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/adduser" element={<Signup />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
    </Router>
  );
}

export default App;