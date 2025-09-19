import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';



const EditProject = () => {
  const [user, setUser] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectMembers, setProjectMembers] = useState(getMembers());
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : 'https://pcp-backend-f4a2.onrender.com';

  function getMembers() {
    const members = async () => {
        const response = await axios.post(`${API_BASE_URL}/api/getmembers/`, {projectName});
        
            setProjectMembers(response.data.members);
        };
    return members;
}

  // Get user email from token and project data from navigation state
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = jwtDecode(token);

        setUser(payload.user_email);
      } catch (error) {
        console.error('Error decoding JWT:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }

    // Get project data from navigation state
    if (location.state?.projectName) {
      setProjectName(location.state.projectName);
    }
  }, [navigate, location]);

  return (
    <div>
      <h1>Edit Project: {projectName}</h1>
      <small>{user} viewing project</small>
      <br />
      <br />
      <h2>Assign Tasks</h2>
      <form>
        <select
            placeholder="Select members"    
        >
            {projectMembers.map((member, index) => (
                <option key={index} value={member}>
                    {member}
                </option>
            ))}
        </select>
      </form>
      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default EditProject;