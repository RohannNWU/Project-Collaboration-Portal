import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [projects] = useState([]); // empty for now

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user'); // clear user session
    navigate('/');                   // redirect to login
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Welcome, {user.username}</h1>
          <span className="dashboard-role">{user.role}</span>
        </div>
        <div className="dashboard-header-right">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <h2>Your Projects</h2>
        {projects.length === 0 ? (
          <p className="dashboard-empty">You have no projects yet.</p>
        ) : (
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={index} className="project-card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
