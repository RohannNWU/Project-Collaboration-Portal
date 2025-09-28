import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AddMembers = () => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('role');
    const [project_id, setProjectId] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
    const project_id = location.state?.projectId;
    if (project_id) {
        setProjectId(project_id);
    }
  }, [location.state?.projectId]);

    const handleAddMember = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';
        try {
            const response = await axios.post(`${API_BASE_URL}/api/addprojectmember/`, { project_id, email, role }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage(response.data.message);
            setEmail('');
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    return (
        <div>
            <h2>Add Project Member</h2>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="role">-- Select Role --</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Group Leader">Group Leader</option>
                <option value="Student">Student</option>
            </select>
            <button onClick={handleAddMember}>Add Member</button>
            {message && <p>{message}</p>}
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
    );
};

export default AddMembers;
