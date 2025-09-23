import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const MyTasks = () => {
    const [user, setUser] = useState('');
    const [tasks, setTasks] = useState([]);
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';

        setUser(location.state?.email || '');

        const getTasks = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/gettasks/`,
                    { headers: { Authorization: `Bearer ${token}` } });
                setTasks(response.data.tasks || []);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setMessage('Failed to fetch tasks');
                setTasks([]); // Fallback to empty array on error
            }
        };
        getTasks();
    }, [location, user]);

    return (
        <div>
            <h1>Tasks for {user}</h1>
            <ul>
                {tasks.map((task, index) => (
                    <li key={index}><strong>{task.task_name}</strong> <br />Due Date: {task.task_due_date} <br />Status: {task.task_status} <br />Project: {task.project_name}<br /><br /></li>
                ))}
            </ul>
            {message && <p>{message}</p>}
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
    );
};

export default MyTasks;