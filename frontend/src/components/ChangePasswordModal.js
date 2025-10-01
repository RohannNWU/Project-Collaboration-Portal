import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './ChangePasswordModal.module.css';  // Reuse styles or create new CSS module

const ResetPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setError('');
    }
  }, [isOpen]);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('All fields are required');
      setTimeout(() => setError(''), 3000);
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setTimeout(() => setError(''), 3000);
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      console.log('Resetting password for:', { email });

      const response = await axios.post(
        `${API_BASE_URL}/api/resetpassword/`,
        {
          email: email,
          password: password,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // If axios reaches here, status is already 2xx
      onSuccess({ email });
      onClose();
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.response?.data?.error || 'Failed to reset password');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

        <div className={styles.modelBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter email address"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>New Password</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.eyeButton}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="Confirm new password"
            />
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
            disabled={loading || !email || !password || !confirmPassword}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

ResetPasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

export default ResetPasswordModal;