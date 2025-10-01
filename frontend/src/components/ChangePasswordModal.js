import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Models.module.css';  // Reuse styles or create new CSS module

const ResetPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  const validateForm = () => {
    if (!email.trim() || !newPassword || !confirmPassword) {
      setError('All fields are required');
      setTimeout(() => setError(''), 3000);
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setTimeout(() => setError(''), 3000);
      return false;
    }

    // Optional: Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setTimeout(() => setError(''), 3000);
      return false;
    }

    // Optional: Password strength
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setTimeout(() => setError(''), 3000);
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      console.log('Updating password for:', { email: email.trim() });

      const response = await axios.post(
        `${API_BASE_URL}/api/resetpassword/`,
        {
          email: email.trim(),
          password: newPassword,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Log full response for debugging
      console.log('Full response:', response);

      // Check for backend errors in response body (even on 200 OK)
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      // Success
      setSuccessMessage('Password updated successfully!');
      onSuccess?.({ email });
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error updating password:', err);
      console.error('Status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);

      let errorMsg = 'Failed to update password';
      if (err.response?.status === 400) {
        errorMsg = err.response.data?.error || 'Invalid email or password';
      } else if (err.response?.status === 404) {
        errorMsg = 'User not found—check your email';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Network error—check your connection';
      } else if (err.message.includes('JSON parse')) {
        errorMsg = 'Invalid response from server';
      } else {
        errorMsg = err.response?.data?.error || err.message || errorMsg;
      }
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modelOverlay} onClick={onClose}>
      <div className={styles.modelContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modelHeader}>
          <h2 className={styles.modelTitle}>Reset Password</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
            &times;
          </button>
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

        <div className={styles.modelBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>New Password</label>
            <div className={styles.passwordInputContainer}>
              <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                placeholder="Enter new password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={toggleNewPasswordVisibility}
                className={styles.togglePassword}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm New Password</label>
            <div className={styles.passwordInputContainer}>
              <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>
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
            onClick={handleResetPassword}
            className={styles.submitButton}
            disabled={loading || !email.trim() || !newPassword || !confirmPassword}
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

ResetPasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default ResetPasswordModal;