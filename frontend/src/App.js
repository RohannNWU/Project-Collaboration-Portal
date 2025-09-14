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
import Calendar from './components/Calendar';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/adduser" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />
          <Route path="/new-project" element={<NewProject />} />
          {/*----------------------------------------
          - Protected Calendar Route
          ----------------------------------------*/}
           <Route
              path="/calendar"
              element={
                <Calendar />
              }
        />
      </Routes>
    </Router>
  );
}

export default App;
