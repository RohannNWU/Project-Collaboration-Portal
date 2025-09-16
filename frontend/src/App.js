import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { AppProvider } from "./context/AppContext";
import Dashboard from "./components/Dashboard";
import CollaborativeDocumentation from "./components/CollaborativeDocumentation";
import DashboardCollabDoc from "./components/DashboardCollabDoc";
import UploadCollabDoc from "./components/UploadCollabDoc";
import TaskCardCollabDoc from "./components/TaskCardCollabDoc";
import StyleCollabDoc from "./components/StyleCollabDoc";
import AppCollabDoc from "./components/AppCollabDoc";
import NewTaskCollabDoc from "./components/NewTaskCollabDoc";
import "./styles/tokens.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/collaborative-documentation"
              element={<CollaborativeDocumentation />}
            />
            <Route
              path="/dashboard-collaborative-documentation"
              element={<DashboardCollabDoc />}
            />
            <Route
              path="/upload-collaborative-documentation"
              element={<UploadCollabDoc />}
            />
            <Route
              path="/task-card-collaborative-documentation"
              element={<TaskCardCollabDoc />}
            />
            <Route
              path="/style-collaborative-documentation"
              element={<StyleCollabDoc />}
            />
            <Route
              path="/app-collaborative-documentation"
              element={<AppCollabDoc />}
            />
            <Route
              path="/new-task-collaborative-documentation"
              element={<NewTaskCollabDoc />}
            />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
