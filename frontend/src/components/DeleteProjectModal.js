// DeleteProjectModal.js (updated to use project.project_id)
import React, { useState } from 'react';
import axios from 'axios';
import styles from './Models.module.css'; // Adjust path as needed
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const DeleteProjectModal = ({ project, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleDelete = async () => {
    if (inputValue !== project.project_name) {
      setMessage('Project name does not match. Please type the exact name.');
      return;
    }
    if (!project.project_id) {
      setMessage('Project ID not found. Cannot delete.');
      return;
    }
    setLoading(true);
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://127.0.0.1:8000'
      : 'https://pcp-backend-f4a2.onrender.com';

    try {
        console.log("IDDDDD: " + project.project_id);
      await axios.delete(
        `${API_BASE_URL}/api/deleteproject/${project.project_id}/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        }
      );
      setMessage('Project deleted successfully');
      if (onSuccess) {
        onSuccess(); // Trigger dashboard refresh
      }
      // Close after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data.error || 'Failed to delete project');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const isDeleteEnabled = inputValue === project.project_name;

  return (
    <div className={styles.modelOverlay} onClick={onClose}>
      <div className={styles.modelContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modelHeader}>
          <h2 className={styles.modelTitle}>
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ff9800', marginRight: '8px' }} />
            Confirm Delete
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modelBody}>
          <p style={{ fontSize: '16px', color: '#042454', marginBottom: '20px' }}>
            Are you sure you want to delete the project "<strong>{project.project_name}</strong>"? 
            This action cannot be undone.
          </p>
          <div className={styles.formGroup}>
            <label className={styles.label}>Type the project name to confirm</label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={styles.input}
              placeholder={`Type "${project.project_name}" to confirm`}
              disabled={loading}
            />
          </div>
          {message && (
            <p className={styles.TaskUpdateModel__errorMessage}>{message}</p>
          )}
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
            onClick={handleDelete}
            disabled={loading || !isDeleteEnabled}
            style={{ 
              backgroundColor: isDeleteEnabled ? '#f44336' : '#b0bec5',
              cursor: isDeleteEnabled ? 'pointer' : 'not-allowed'
            }}
          >
            {loading ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProjectModal;