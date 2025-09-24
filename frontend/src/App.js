import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from "./context/AppContext";
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import NewProject from './components/NewProject';
import MyTasks from './components/MyTasks';
import EditProject from './components/EditProject';
import UploadCollabDoc from './components/UploadCollabDoc';
import CollaborativeDocumentation from './components/CollaborativeDocumentation';

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/adduser" element={<Signup />} />
          <Route path="/newproject" element={<NewProject />} />
          <Route path="/mytasks" element={<MyTasks />} />
          <Route path="/editproject" element={<EditProject />} />
          <Route path="/uploadcollabdoc" element={<UploadCollabDoc />} />
          <Route path="/collabdoc" element={<CollaborativeDocumentation />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;