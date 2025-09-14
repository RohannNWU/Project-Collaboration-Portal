//----------------------------------------
// 35317906 - Jacques van Heerden -
// Application Routes
//----------------------------------------

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
<<<<<<< HEAD
import Calendar from './components/Calendar';   // ✅ Import Calendar
=======
import NewProject from './components/NewProject';

>>>>>>> rohann

function App() {
  return (
    <Router>
        <Routes>
<<<<<<< HEAD
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/*----------------------------------------
          - Protected Calendar Route
          ----------------------------------------*/}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />

=======
>>>>>>> rohann
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/adduser" element={<Signup />} />
          <Route path="/newproject" element={<NewProject />} />
        </Routes>
    </Router>
  );
}

export default App;
