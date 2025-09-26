import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const MyTasks = () => {
    const [user, setUser] = useState('');
    const [tasks, setTasks] = useState([]);
    const [documents, setDocuments] = useState({});
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
                const response = await axios.get(`${API_BASE_URL}/api/getprojecttasks/`, { params: { project_id: 1 } });
                setTasks(response.data.tasks || []);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setMessage('Failed to fetch tasks');
                setTasks([]); // Fallback to empty array on error
            }
        };
        getTasks();
    }, [location, user]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                // Create an array of promises for all API calls
                const documentPromises = tasks.map(task =>
                    axios.get(`${API_BASE_URL}/api/gettaskdocuments/`, { params: { task_id: task.task_id } })
                        .then(response => ({ task_id: task.task_id, documents: response.data.documents || [] }))
                );

                // Wait for all API calls to resolve
                const results = await Promise.all(documentPromises);

                // Build an object mapping task_id to its documents
                const documentsByTask = results.reduce((acc, { task_id, documents }) => {
                    acc[task_id] = documents;
                    return acc;
                }, {});

                // Update state with the documents mapping
                setDocuments(documentsByTask);
            } catch (error) {
                console.error('Error fetching documents:', error);
                setDocuments({}); // Handle error by resetting state or setting an error state
            }
        };

        if (tasks.length > 0) {
            fetchDocuments();
        }
    }, [tasks]);

    return (
        <div>
            <h1>Tasks for {user}</h1>
            <ul>
                {tasks.map((task, index) => (
                    <li key={index}>
                        <strong>{task.task_name}</strong>
                        <br />
                        Description: {task.task_description}
                        <br />
                        Priority: {task.task_priority}
                        <br />
                        Due Date: {task.task_due_date}
                        <br />
                        Status: {task.task_status}
                        <br />
                        Members:{" "}
                        {task.assigned_members && task.assigned_members.length > 0 ? (
                            task.assigned_members.map((member, memberIndex) => (
                                <span key={memberIndex}>
                                    {member.fname} {member.lname}
                                    {memberIndex < task.assigned_members.length - 1 ? ", " : ""}
                                </span>
                            ))
                        ) : (
                            "Unassigned"
                        )}
                        <br />
                    </li>
                ))}
            </ul>
            {message && <p>{message}</p>}
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
    );
};

export default MyTasks;