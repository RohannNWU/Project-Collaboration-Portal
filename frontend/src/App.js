import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from "./context/AppContext";
import { AuthProvider, useAuth } from './context/AuthProvider';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import NewProject from './components/NewProject';
import MyTasks from './components/MyTasks';
import EditProject from './components/EditProject';
import UploadCollabDoc from './components/UploadCollabDoc';
import CollaborativeDocumentation from './components/CollaborativeDocumentation';
import DocumentManager from './components/DocumentManager';
import ChatWindow from './components/ChatWindow';

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
        <AppProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/adduser" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/newproject" element={<NewProject />} />
              <Route path="/mytasks" element={<MyTasks />} />
              <Route path="/editproject" element={<EditProject />} />
              <Route path="/uploadcollabdoc" element={<UploadCollabDoc />} />
              <Route path="/collabdoc" element={<CollaborativeDocumentation />} />
              <Route path="/documents" element={<DocumentManager />} />
              <Route path="/chatwindow/:projectId" element={<ChatWindow />} />

            </Route>
            
            {/* Redirect any unknown paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
