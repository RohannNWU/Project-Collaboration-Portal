import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './AddMemberModal.module.css'; // Adjust import as needed

const AddMemberModal = ({ isOpen, onClose, projectId, projectName }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('role');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loggedInEmail, setLoggedInEmail] = useState('');
    const navigate = useNavigate();

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setRole('role');
            setMessage('');
        }
    }, [isOpen]);

    // Fetch logged-in user's email using JWT token
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const API_BASE_URL =
            window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

        axios
            .get(`${API_BASE_URL}/api/dashboard/`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setLoggedInEmail(response.data.email);
            })
            .catch((error) => {
                console.error('Failed to fetch user email:', error);
            });
    }, []);

    const handleAddMember = async () => {
        if (!email || role === 'role') {
            setMessage('Please enter a valid email and select a role.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const API_BASE_URL =
            window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

        try {
            // Step 1: Add member to project
            const response = await axios.post(
                `${API_BASE_URL}/api/addprojectmember/`,
                { project_id: projectId, email, role },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(response.data.message);

            // Step 2: Send notification to the added member
            await axios.post(
                `${API_BASE_URL}/api/createnotification/`,
                {
                    emails: [email], // Send only to the added member
                    title: 'Added to Project',
                    message: `${loggedInEmail} added you to project "${projectName}" as a ${role}.`,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEmail('');
            setRole('role');
            setMessage('Member added and notified successfully.');

            // Close modal after success
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error adding member:', error);
            setMessage(error.response?.data?.error || 'Failed to add member.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Add Project Member</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Member Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter member email"
                            className={styles.input}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className={styles.input}
                            disabled={loading}
                        >
                            <option value="role">-- Select Role --</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Group Leader">Group Leader</option>
                            <option value="Student">Student</option>
                        </select>
                    </div>

                    {message && <p className={styles.message}>{message}</p>}
                </div>

                <div className={styles.modalFooter}>
                    <button
                        className={styles.cancelButton}
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.submitButton}
                        onClick={handleAddMember}
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Member'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddMemberModal;
