import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GroupLeaderDashboard = () => {
    const navigate = useNavigate();

  const handleAddProject = () => {
    navigate('/newproject');
  };

  return (
    <div>
        <h2>Group Leader Dashboard</h2>
        <button onClick={handleAddProject}>Add New Project</button>
    </div>
  );
};

export default GroupLeaderDashboard;