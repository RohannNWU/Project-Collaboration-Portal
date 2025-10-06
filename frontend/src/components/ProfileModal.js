import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import styles from './ProfileModal.module.css'; // Assuming you create this CSS module

const ProfileModal = ({ onClose, onSuccess, email: initialEmail }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : 'https://pcp-backend-f4a2.onrender.com';

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          onClose();
          return;
        }

        const response = await axios.post(`${API_BASE_URL}/api/getuserdetails/`, { initialEmail });
        setFirstName(response.data.user_details.first_name || '');
        setLastName(response.data.user_details.last_name || '');
        setSecurityQuestion(response.data.user_details.security_question || '');
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
      }
    };

    fetchProfileData();
  }, [initialEmail, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!firstName || !lastName || !securityQuestion || !securityAnswer) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const updateData = {
        first_name: firstName,
        last_name: lastName,
        security_question: securityQuestion,
        security_answer: securityAnswer,
        password: newPassword || undefined, // Only send if provided
      };

      // Assuming update endpoint /api/update-profile/
      await axios.put(`${API_BASE_URL}/api/update-profile/`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onSuccess();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Edit Profile</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.fieldGroup}>
            <label>Email (not editable)</label>
            <input type="email" value={initialEmail} readOnly className={styles.readOnlyInput} />
          </div>
          <div className={styles.fieldGroup}>
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>Security Question</label>
            <input
              type="text"
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              placeholder="e.g., What is your mother's maiden name?"
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>Security Answer</label>
            <input
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>New Password (optional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Saving...' : <><FontAwesomeIcon icon={faSave} /> Submit</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;