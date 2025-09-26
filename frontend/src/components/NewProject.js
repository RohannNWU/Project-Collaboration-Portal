import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './NewProject.module.css';

const NewProject = () => {
    const [email, setEmail] = useState('');
    const [projectname, setProjectname] = useState('');
    const [project_description, setProjectDescription] = useState('');
    const [project_due_date, setProjectDueDate] = useState('');
    const [memberName, setMemberName] = useState('');
    const [project_members, setProjectMembers] = useState([]);
    const [message, setMessage] = useState('');
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
                setEmail(response.data.email);
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    setMessage('Invalid credentials');
                    navigate('/');
                }
            });
    }, [navigate]);

    const handleInputChange = (event) => {
        setMemberName(event.target.value);
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        if (memberName.trim()) {
            const emailWithDomain = `${memberName.trim()}@mynwu.ac.za`;
            setProjectMembers([emailWithDomain, ...project_members]);
            setMemberName('');
        }
    }

    const createNewProject = async (event) => {
        event.preventDefault();
        project_members.unshift(email);
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';

        const response = await axios.post(
            `${API_BASE_URL}/api/newproject/`,
            {
                project_name: projectname,
                project_description: project_description,
                project_due_date: project_due_date,
                project_members: project_members
            },
            {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            }
        );
        setMessage(response.data.message);
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>
                    New Project for {email}
                </h1>
                <form onSubmit={createNewProject} className={styles.form}>
                    <div>
                        <input
                            type="text"
                            placeholder="Project Name"
                            value={projectname}
                            onChange={(e) => setProjectname(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div>
                        <textarea
                            placeholder="Project Description"
                            value={project_description}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            required
                            className={styles.textarea}
                            rows="4"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            placeholder="Submission Date"
                            value={project_due_date}
                            onChange={(e) => setProjectDueDate(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.memberInputContainer}>
                        <input
                            type="text"
                            placeholder="Project Member"
                            value={memberName}
                            onChange={handleInputChange}
                            className={styles.memberInput}
                        />
                        <button
                            onClick={handleAddMember}
                            className={styles.addButton}
                        >
                            Add Member
                        </button>
                    </div>
                    <div>
                        <textarea
                            value={project_members.join('; \n')}
                            disabled
                            rows="8"
                            className={styles.disabledTextarea}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className={styles.submitButton}
                        >
                            Create Project
                        </button>
                    </div>
                    {message && (
                        <p className={styles.message}>{message}</p>
                    )}
                </form>
                <button
                    onClick={() => navigate('/dashboard')}
                    className={styles.backButton}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default NewProject;