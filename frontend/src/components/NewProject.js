import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './NewProject.module.css';


const NewProject = () => {
    const [username, setUsername] = useState('');
    const [projectname, setProjectname] = useState('');
    const [duedate, setDuedate] = useState('');
    const [projectmembers, setProjectmembers] = useState('');
    const [error, setError] = useState('');
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

    const createNewProject = async (e) => {
        e.preventDefault();

        try {
            const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';
            const response = await axios.post(`${API_BASE_URL}/api/newproject/`, { projectname, duedate, projectmembers });
            setError(response.data.message);
        } catch (err) {
            setError("Failed to create project")
        }
    };

    return (
        <div className={styles.newproject}>
            <h1>New Project for {username}</h1>
            <p>
                This is the New Project page.
                We require the following information for the creation of
                a new project: <br /><br />
                1. Project Name<br />
                2. Due Date<br />
                3. Project Members
            </p>

            <form id="newprojectform" onSubmit={createNewProject}>
                <input
                    id="projectname"
                    name="projectname"
                    type="text"
                    placeholder="Project Name"
                    required
                    value={projectname}
                    onChange={(e) => setProjectname(e.target.value)}
                />
                <input
                    id="duedate"
                    name="duedate"
                    type="date"
                    placeholder="Due Date"
                    required
                    value={duedate}
                    onChange={(e) => setDuedate(e.target.value)}
                />
                <textarea
                    id="projectmembers"
                    name="projectmembers"
                    placeholder="Project Members"
                    required
                    value={projectmembers}
                    onChange={(e) => setProjectmembers(e.target.value)}
                />
                <button type="submit">Create Project</button>
            </form>

            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            <p>{error}</p>
        </div>
    );
};

export default NewProject;
