import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewProject = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    
useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

    axios.get(`${API_BASE_URL}/api/dashboard/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setUsername(response.data.username);
      })
      .catch(err => {
        if (err.response && err.response.status === 401) {
          navigate('/');
        }
      });
    }, [navigate]);

    const createNewProject = (e) => {
        e.preventDefault();

    };

    return (
        <div>
            <h1>New Project for {username}</h1>
            <p>
                This is the New Project page.
                We require the following information for the creation of
                a new project: <br /><br />
                1. Project Name<br />
                2. Due Date<br />
                3. Project Members
            </p>

            <form id="newProjectForm"  onSubmit={createNewProject}>
                <input type="text" placeholder="Project Name" />
                <input type="date" placeholder="Due Date" />
                <input type="text" placeholder="Project Members" />
                <button type="submit">Create Project</button>
            </form>
            
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
    );
};

export default NewProject;
