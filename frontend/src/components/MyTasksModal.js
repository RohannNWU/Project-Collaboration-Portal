import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons'; // For close button, adjust if needed
import styles from './Models.module.css'; // Assuming similar styles as previous modals; adjust path

const MyTasksModal = ({ isOpen, onClose, email }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchTasks();
        }
    }, [isOpen]);

    const fetchTasks = async () => {
        setLoading(true);
        setError('');
        try {
            const API_BASE_URL = window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

            const response = await axios.post(`${API_BASE_URL}/api/getusertasks/`,  { email });
            setTasks(response.data.tasks || []);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to fetch tasks');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modelOverlay} onClick={onClose}>
            <div className={styles.modelContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modelHeader}>
                    <h2 className={styles.modelTitle}>Tasks for {email}</h2>
                    <button 
                        onClick={onClose} 
                        className={styles.closeButton} 
                        aria-label="Close modal"
                        disabled={loading}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className={styles.modelBody}>
                    {loading ? (
                        <p>Loading tasks...</p>
                    ) : error ? (
                        <div className={styles.errorMessage}>{error}</div>
                    ) : tasks.length === 0 ? (
                        <p>No tasks available.</p>
                    ) : (
                        <ul className={styles.taskList}>
                            {tasks.map((task, index) => (
                                <li key={index} className={styles.taskItem}>
                                    <strong>{task.task_name}</strong>
                                    <br />
                                    Description: {task.task_description}
                                    <br />
                                    Priority: {task.task_priority}
                                    <br />
                                    Due Date: {task.task_due_date}
                                    <br />
                                    Status: {task.task_status}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className={styles.modelFooter}>
                    <button
                        type="button"
                        onClick={onClose}
                        className={styles.cancelButton}
                        disabled={loading}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyTasksModal;