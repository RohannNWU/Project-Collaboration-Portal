//----------------------------------------
// 35317906 - Jacques van Heerden -
// Application Routes
//----------------------------------------

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import NewProject from './components/NewProject';
import EditProject from './components/EditProject';
import Calendar from './components/Calendar';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/adduser" element={<Signup />} />
        <Route path="/newproject" element={<NewProject />} />
        <Route path="/editproject" element={<EditProject />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/chatwindow/:projectId" element={<ChatWindow />} />
      </Routes>
    </Router>
  );
}

export default App;
