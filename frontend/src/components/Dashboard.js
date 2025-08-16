import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user.username} ({user.role})</p>
      <h3>Your Projects:</h3>
      <div id="projects-list">
        {/* Empty for now; you can populate this later */}
      </div>
    </div>
  );
}

export default Dashboard;