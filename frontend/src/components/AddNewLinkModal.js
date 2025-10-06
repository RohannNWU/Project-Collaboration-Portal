// AddLinkModal.js
import React, { useState } from 'react';
import axios from 'axios';
import styles from './Models.module.css'; // Adjust path as needed

const AddLinkModal = ({ isOpen, onClose, projectId, onSuccess }) => {
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      setError('Please fill in both title and URL.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        onClose();
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      await axios.post(`${API_BASE_URL}/api/addprojectlink/`, {
        project_id: projectId,
        link_name: newLinkTitle,
        link: newLinkUrl
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewLinkTitle('');
      setNewLinkUrl('');
      onSuccess(); // Trigger success callback (e.g., refresh links)
      onClose();
    } catch (err) {
      console.error('Error adding link:', err);
      setError('Failed to add link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modelOverlay} onClick={onClose}>
      <div className={styles.modelContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modelHeader}>
          <h3 className={styles.modelTitle}>Add Important Link</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.modelBody}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <div className={styles.formGroup}>
            <label htmlFor="link-title" className={styles.label}>Link Title</label>
            <input
              type="text"
              id="link-title"
              placeholder="Enter link title (e.g., Project Documentation)"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              className={styles.input}
              disabled={loading}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="link-url" className={styles.label}>Link URL</label>
            <input
              type="url"
              id="link-url"
              placeholder="Enter full URL (e.g., https://example.com)"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className={styles.input}
              disabled={loading}
              required
            />
          </div>
          <div className={styles.modelFooter}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading || !newLinkTitle.trim() || !newLinkUrl.trim()}>
              {loading ? 'Adding...' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLinkModal;