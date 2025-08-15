import React from 'react';
import { useNavigate } from 'react-router-dom'; // If using React Router

function Dashboard() {
  const navigate = useNavigate();
  const username = "user"; // Replace with dynamic user data from login response
  const lastLogin = "August 15, 2025, 04:01 PM SAST"; // Replace with actual login time

  const handleLogout = () => {
    // Add logout logic (e.g., clear token, redirect to login)
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Project Collaboration Portal Dashboard</h1>
      </div>
      <div className="welcome">
        Welcome, <span>{username}!</span>
      </div>
      <div className="user-info">
        <h2>User Information</h2>
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Last Login:</strong> {lastLogin}</p>
      </div>
      <div className="section">
        <h2>Recent Activities</h2>
        <p>View your recent project updates and tasks here.</p>
      </div>
      <div className="section">
        <h2>Projects Overview</h2>
        <p>Monitor your active projects and progress.</p>
      </div>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
}

export default Dashboard;