import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Models.module.css'; // Adjust path as needed

const NewProjectModal = ({ onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [projectname, setProjectname] = useState('');
    const [project_description, setProjectDescription] = useState('');
    const [project_due_date, setProjectDueDate] = useState('');
    const [memberName, setMemberName] = useState('');
    const [project_members, setProjectMembers] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
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
    };

    const createNewProject = async (event) => {
        event.preventDefault();
        setLoading(true);
        const membersWithOwner = [email, ...project_members];
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/newproject/`,
                {
                    project_name: projectname,
                    project_description: project_description,
                    project_due_date: project_due_date,
                    project_members: membersWithOwner
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                }
            );
            setMessage(response.data.message);
            if (onSuccess) {
                onSuccess(); // Trigger dashboard refresh
            }
            // Optionally close after a short delay to show success message
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setMessage(error.response?.data.error || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const handleSubmit = (e) => {
        createNewProject(e);
    };

    if (!email) return null; // Wait for email to load

    return (
        <div className={styles.modelOverlay} onClick={onClose}>
            <div className={styles.modelContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modelHeader}>
                    <h2 className={styles.modelTitle}>New Project for {email}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className={styles.modelBody}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Project Name</label>
                            <input
                                type="text"
                                value={projectname}
                                onChange={(e) => setProjectname(e.target.value)}
                                required
                                className={styles.input}
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Project Description</label>
                            <textarea
                                value={project_description}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                required
                                className={styles.textarea}
                                rows="4"
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Due Date</label>
                            <input
                                type="date"
                                value={project_due_date}
                                onChange={(e) => setProjectDueDate(e.target.value)}
                                required
                                className={styles.input}
                                disabled={loading}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Add Project Member</label>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Enter member name"
                                    value={memberName}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    style={{ flex: 1 }}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddMember}
                                    className={styles.submitButton}
                                    style={{ padding: '12px 15px', minWidth: '120px' }}
                                    disabled={loading}
                                >
                                    Add Member
                                </button>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Project Members</label>
                            <textarea
                                value={project_members.join(';\n')}
                                disabled
                                rows="6"
                                className={styles.textarea}
                                style={{ backgroundColor: '#f0f0f0' }}
                            />
                        </div>
                        {message && (
                            <p className={styles.TaskUpdateModel__errorMessage}>{message}</p>
                        )}
                    </form>
                </div>
                <div className={styles.modelFooter}>
                    <button 
                        type="button" 
                        className={styles.cancelButton} 
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className={styles.submitButton} 
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewProjectModal;