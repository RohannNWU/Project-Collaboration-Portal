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

    // Calculate tomorrow's date for the min attribute
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }
        const API_BASE_URL =
            window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

        axios
            .get(`${API_BASE_URL}/api/dashboard/`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setEmail(response.data.email);
                setProjectMembers([response.data.email]); // Automatically add logged-in user's email
            })
            .catch((err) => {
                if (err.response && err.response.status === 401) {
                    setMessage('Invalid credentials');
                    navigate('/');
                }
            });
    }, [navigate]);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInputChange = (event) => {
        setMemberName(event.target.value);
        setMessage('');
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        const trimmedMemberName = memberName.trim();
        if (!trimmedMemberName) {
            setMessage('Please enter an email address');
            return;
        }
        if (!isValidEmail(trimmedMemberName)) {
            setMessage('Please enter a valid email address');
            return;
        }
        if (project_members.includes(trimmedMemberName)) {
            setMessage('This email is already added');
            return;
        }

        const API_BASE_URL =
            window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/getuserdetails/`,
                { initialEmail: trimmedMemberName }
            );

            if (response.data.success) {
                setProjectMembers([...project_members, trimmedMemberName]);
                setMemberName('');
                setMessage('Member added successfully');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            setMessage(error.response?.data.error || 'Failed to validate email');
        }
    };

    const handleRemoveMember = (index) => {
        const memberToRemove = project_members[index];
        if (memberToRemove === email) {
            setMessage('Cannot remove the project owner');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        setProjectMembers(project_members.filter((_, i) => i !== index));
        setMessage('Member removed successfully');
        setTimeout(() => setMessage(''), 3000);
    };

    const createNewProject = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (project_members.length < 2) {
            setMessage('At least 2 project members are required');
            setLoading(false);
            return;
        }

        const API_BASE_URL =
            window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

        const token = localStorage.getItem('access_token');

        try {
            // Step 1: Create project
            const response = await axios.post(
                `${API_BASE_URL}/api/newproject/`,
                {
                    project_name: projectname,
                    project_description: project_description,
                    project_due_date: project_due_date,
                    project_members: project_members,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setMessage(response.data.message);

            // Step 2: Send notification to all members
            await axios.post(
                `${API_BASE_URL}/api/createnotification/`,
                {
                    emails: project_members,
                    title: 'New Project Created',
                    message: `${email} added you to project "${projectname}".`,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (onSuccess) onSuccess();
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

    if (!email) return null;

    return (
        <div className={styles.modelOverlay}>
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
                                min={minDate}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Add Project Member</label>
                            <div
                                style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}
                            >
                                <input
                                    type="text"
                                    placeholder="Enter member email"
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
                            <div
                                style={{
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    padding: '0.5rem',
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    backgroundColor: '#f0f0f0',
                                    minHeight: '100px',
                                }}
                            >
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {project_members.map((member, index) => (
                                        <li
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '5px 10px',
                                                borderBottom: '1px solid #eee',
                                            }}
                                        >
                                            <span>{member}</span>
                                            {member !== email && (
                                                <span
                                                    style={{
                                                        color: 'red',
                                                        cursor: 'pointer',
                                                        fontSize: '0.875rem',
                                                    }}
                                                    onClick={() => handleRemoveMember(index)}
                                                >
                                                    (remove)
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                {project_members.length === 0 && (
                                    <p
                                        style={{
                                            textAlign: 'center',
                                            color: '#666',
                                            margin: '10px 0',
                                        }}
                                    >
                                        No members added
                                    </p>
                                )}
                            </div>
                        </div>

                        {message && (
                            <p
                                className={styles.TaskUpdateModel__errorMessage}
                                style={{
                                    color: message.includes('successfully') ? 'green' : 'red',
                                }}
                            >
                                {message}
                            </p>
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
