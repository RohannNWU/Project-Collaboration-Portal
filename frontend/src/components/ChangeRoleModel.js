import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './ChangeRoleModel.module.css';

const ChangeRoleModel = ({ isOpen, onClose, projectId, memberEmail, onUpdate, initialRole = '', projectName }) => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const allRoles = ['Group Leader', 'Student'];

  useEffect(() => {
    if (isOpen) {
      setRole('');
      setError('');
    }
  }, [isOpen]);

  const handleUpdateRole = async () => {
    try {
      if (!memberEmail || !projectId || !role) {
        setError('All fields are required');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setLoading(true);
      setError('');

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to continue');
        return;
      }

      const API_BASE_URL =
        window.location.hostname === 'localhost'
          ? 'http://127.0.0.1:8000'
          : 'https://pcp-backend-f4a2.onrender.com';

      console.log('Updating role with:', { projectId, email: memberEmail, new_role: role });

      // Step 1: Update the member’s role
      const response = await axios.post(
        `${API_BASE_URL}/api/changerole/`,
        {
          project_id: projectId,
          email: memberEmail,
          new_role: role,
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        // Step 2: Decode JWT to get the logged-in user's email
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        const loggedInEmail = payload.email || payload.user_email || payload.sub || 'Unknown user';

        // Step 3: Notify the member about their role change
        await axios.post(
          `${API_BASE_URL}/api/createnotification/`,
          {
            emails: [memberEmail],
            title: 'Role Updated',
            message: `${loggedInEmail} changed your role to ${role} in project "${projectName}".`,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Step 4: Reflect change in frontend state
        onUpdate({ projectId, memberEmail, role });
        onClose();
      } else {
        setError('Failed to update role');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error.response?.data?.error || 'Failed to update role');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modelOverlay} onClick={onClose}>
      <div className={styles.modelContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modelHeader}>
          <h2 className={styles.modelTitle}>Change Role</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
            &times;
          </button>
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div className={styles.modelBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Select New Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={styles.input}
            >
              <option value="">-- Select Role --</option>
              {allRoles.filter(r => r !== initialRole).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.modelFooter}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdateRole}
            className={styles.submitButton}
            disabled={loading || !role}
          >
            {loading ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </div>
  );
};

ChangeRoleModel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  memberEmail: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  initialRole: PropTypes.string,
  projectName: PropTypes.string,
};

ChangeRoleModel.defaultProps = {
  initialRole: '',
  projectName: 'Unknown Project',
};

export default ChangeRoleModel;
