import React, { useState } from 'react';
import axios from 'axios';
import styles from './CreateMeetingModal.module.css';  // Adjust the path as needed

const CreateMeetingModal = ({ isOpen, onClose, projectId, dueDate }) => {  // Added dueDate prop
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingDate, setMeetingDate] = useState('');
    const [meetingTime, setMeetingTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Compute min and max dates
    const today = new Date().toISOString().split('T')[0];  // YYYY-MM-DD format
    let maxDateStr = '';
    if (dueDate) {
        // Parse DD/MM/YYYY format to YYYY-MM-DD
        const parts = dueDate.split('/');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            const isoDate = `${year}-${month}-${day}`;
            const maxDate = new Date(isoDate);
            if (!isNaN(maxDate.getTime())) {
                maxDate.setDate(maxDate.getDate() + 7);  // One week after due date
                maxDateStr = maxDate.toISOString().split('T')[0];
                // Ensure max is not before today
                if (maxDateStr < today) {
                    maxDateStr = today;
                }
            }
        }
    }

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!meetingTitle || !meetingDate || !meetingTime) {
            setError('All fields are required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const dateTimeStr = `${meetingDate} ${meetingTime}`;

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const API_BASE_URL = window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

            const response = await axios.post(`${API_BASE_URL}/api/addmeeting/`, {
                project_id: projectId,
                meeting_title: meetingTitle,
                date_time: dateTimeStr,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status !== 201) {
                throw new Error(response.data.error || 'Failed to create meeting');
            }
            console.log('Meeting created:', response.data);  // Handle success, e.g., refresh meetings list
            handleClose();  // Reset states and close
        } catch (err) {
            setError(err.message || 'An error occurred while creating the meeting');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setMeetingTitle('');
        setMeetingDate('');
        setMeetingTime('');
        setError('');
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Create Meeting</h2>
                    <button className={styles.closeButton} onClick={handleClose}>
                        ×
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <form id="meetingForm" onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="meetingTitle">Meeting Title:</label>
                            <input
                                type="text"
                                id="meetingTitle"
                                className={styles.input}
                                value={meetingTitle}
                                onChange={(e) => setMeetingTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="meetingDate">Meeting Date:</label>
                            <input
                                type="date"
                                id="meetingDate"
                                className={styles.input}
                                value={meetingDate}
                                min={today}
                                max={maxDateStr || undefined}
                                onChange={(e) => setMeetingDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="meetingTime">Meeting Time:</label>
                            <input
                                type="time"
                                id="meetingTime"
                                className={styles.input}
                                value={meetingTime}
                                onChange={(e) => setMeetingTime(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className={styles.errorMessage}>{error}</div>}
                    </form>
                </div>
                <div className={styles.modalFooter}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="meetingForm"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Meeting'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateMeetingModal;