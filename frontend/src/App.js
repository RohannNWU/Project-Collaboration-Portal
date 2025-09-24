import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import NewProject from './components/NewProject';
import EditProject from './components/EditProject';
import MyTasks from './components/MyTasks';
import CollaborativeDocumentation from "./components/CollaborativeDocumentation";
import DashboardCollabDoc from "./components/DashboardCollabDoc";
import UploadCollabDoc from "./components/UploadCollabDoc";
import TaskCardCollabDoc from "./components/TaskCardCollabDoc";
import StyleCollabDoc from "./components/StyleCollabDoc";
import AppCollabDoc from "./components/AppCollabDoc";
import NewTaskCollabDoc from "./components/NewTaskCollabDoc";
import DocumentManager from "./components/DocumentManager";

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/adduser" element={<Signup />} />
          <Route path="/newproject" element={<NewProject />} />
          <Route path="/editproject" element={<EditProject />} />
          <Route path="/mytasks" element={<MyTasks />} />
          <Route path="/collaborativedocumentation" element={<CollaborativeDocumentation />} />
          <Route path="/dashboardcollabdoc" element={<DashboardCollabDoc />} />
          <Route path="/uploadcollabdoc" element={<UploadCollabDoc />} />
          <Route path="/taskcardcollabdoc" element={<TaskCardCollabDoc />} />
          <Route path="/stylecollabdoc" element={<StyleCollabDoc />} />
          <Route path="/appcollabdoc" element={<AppCollabDoc />} />
          <Route path="/newtaskcollabdoc" element={<NewTaskCollabDoc />} />
          <Route path="/documentmanager" element={<DocumentManager />} />
        </Routes>
    </Router>
  );
}

export default App;
