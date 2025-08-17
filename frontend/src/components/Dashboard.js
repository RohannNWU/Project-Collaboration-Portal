import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('user');
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user.username} ({user.role})</p>
      <button onClick={handleLogout}>Logout</button>

      <h3>Your Projects:</h3>
      <div id="projects-list">
        {/* Populate projects later */}
      </div>
    </div>
  );
}

export default Dashboard;
