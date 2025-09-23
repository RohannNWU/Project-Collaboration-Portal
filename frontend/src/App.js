import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthProvider";
import { AppProvider } from "./context/AppContext";
import Dashboard from "./components/Dashboard";
import CollaborativeDocumentation from "./components/CollaborativeDocumentation";
import DashboardCollabDoc from "./components/DashboardCollabDoc";
import UploadCollabDoc from "./components/UploadCollabDoc";
import TaskCardCollabDoc from "./components/TaskCardCollabDoc";
import StyleCollabDoc from "./components/StyleCollabDoc";
import AppCollabDoc from "./components/AppCollabDoc";
import NewTaskCollabDoc from "./components/NewTaskCollabDoc";
import DocumentManager from "./components/DocumentManager";
import Login from "./components/Login";
import "./styles/tokens.css";

// Protected Route component to handle authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const authResult = isAuthenticated();
  
  console.log('=== ProtectedRoute Check ===');
  console.log('Authentication result:', authResult);
  console.log('Will render:', authResult ? 'children (Dashboard)' : 'Navigate to login');
  
  return authResult ? children : <Navigate to="/login" />;
};

// Home Route component to handle smart routing
const HomeRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const authResult = isAuthenticated();
  
  console.log('=== HomeRoute Check ===');
  console.log('Authentication result:', authResult);
  console.log('Will redirect to:', authResult ? 'Dashboard' : 'Login');
  
  return authResult ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/collaborative-documentation"
              element={
                <ProtectedRoute>
                  <CollaborativeDocumentation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-collaborative-documentation"
              element={
                <ProtectedRoute>
                  <DashboardCollabDoc />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-collaborative-documentation"
              element={
                <ProtectedRoute>
                  <UploadCollabDoc />
                </ProtectedRoute>
              }
            />
            <Route
              path="/task-card-collaborative-documentation"
              element={
                <ProtectedRoute>
                  <TaskCardCollabDoc />
                </ProtectedRoute>
              }
            />
            <Route
              path="/style-collaborative-documentation"
              element={
                <ProtectedRoute>
                  <StyleCollabDoc />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app-collaborative-documentation"
              element={
                <ProtectedRoute>
                  <AppCollabDoc />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-task-collaborative-documentation"
              element={
                <ProtectedRoute>
                  <NewTaskCollabDoc />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
                  <DocumentManager />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
