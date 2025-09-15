import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./components/DashboardHome";
import FileManager from "./components/FileManager";
import Calendar from "./components/Calendar";
import NewProject from "./components/NewProject"
import ChatWindow from "./components/ChatWindow";

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />        {/* default middle */}
          <Route path="documents" element={<FileManager />} /> {/* documents */}
          <Route path="calendar" element={<Calendar />} />   {/* calendar */}
          <Route path="newproject" element={<NewProject />} />   {/* new project */}
          <Route path="chatwindow" element={<ChatWindow />} />   {/* chat window */}
        </Route>

        {/* Default route → Dashboard */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
