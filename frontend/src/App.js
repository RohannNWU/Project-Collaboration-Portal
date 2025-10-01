import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthProvider';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import StudentDashboard from './components/StudentDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import GroupLeaderDashboard from './components/GroupLeaderDashboard';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');
  
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }
  
  return children ? children : <Outlet />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/adduser" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/studentdashboard" element={<StudentDashboard />} />
              <Route path="/supervisordashboard" element={<SupervisorDashboard />} />
              <Route path="/groupleaderdashboard" element={<GroupLeaderDashboard />} />
            </Route>
            
            {/* Redirect any unknown paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;