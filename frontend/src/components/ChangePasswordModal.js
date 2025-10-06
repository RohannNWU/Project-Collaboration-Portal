import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Models.module.css';  // Reuse styles or create new CSS module

const ResetPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [stage, setStage] = useState('email');
  const [initialEmail, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStage('email');
      setEmail('');
      setSecurityQuestion('');
      setSecurityAnswer('');
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const clearError = () => {
    setTimeout(() => setError(''), 3000);
  };

  const handleVerifyEmail = async () => {
    if (!initialEmail.trim()) {
      setError('Email is required');
      clearError();
      return;
    }

    if (!emailRegex.test(initialEmail)) {
      setError('Please enter a valid email address');
      clearError();
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.post(`${API_BASE_URL}/api/getuserdetails/`, { initialEmail });

      if (response.data?.success) {
        setSecurityQuestion(response.data.user_details?.security_question || 'Security question not provided');
        setStage('security');
        setError('');
      } else {
        setError(response.data?.error || 'Email not found');
        clearError();
      }
    } catch (err) {
      console.error('Error verifying email:', err);
      console.error('Status:', err.response?.status);
      console.error('Response data:', err.response?.data);

      let errorMsg = 'Failed to verify email';
      if (err.response?.status === 404) {
        errorMsg = 'Email not found';
      } else if (err.response?.status === 400) {
        errorMsg = err.response.data?.error || 'Invalid email';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Network error—check your connection';
      } else {
        errorMsg = err.response?.data?.error || err.message || errorMsg;
      }
      setError(errorMsg);
      clearError();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async () => {
    if (!securityAnswer.trim()) {
      setError('Security answer is required');
      clearError();
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.post(
        `${API_BASE_URL}/api/verifysecurityanswer/`,
        {
          email: initialEmail.trim(),
          security_answer: securityAnswer.trim(),
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Verify answer response:', response);

      if (response.data?.success) {
        setStage('password');
        setSecurityAnswer('');
        setError('');
      } else {
        setError(response.data?.error || 'Incorrect security answer');
        clearError();
      }
    } catch (err) {
      console.error('Error verifying answer:', err);
      console.error('Status:', err.response?.status);
      console.error('Response data:', err.response?.data);

      let errorMsg = 'Failed to verify security answer';
      if (err.response?.status === 400) {
        errorMsg = err.response.data?.error || 'Invalid answer';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Network error—check your connection';
      } else {
        errorMsg = err.response?.data?.error || err.message || errorMsg;
      }
      setError(errorMsg);
      clearError();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Passwords are required');
      clearError();
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      clearError();
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      clearError();
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      console.log('Updating password for:', { email: initialEmail.trim() });

      const response = await axios.post(
        `${API_BASE_URL}/api/resetpassword/`,
        {
          email: initialEmail.trim(),
          password: newPassword,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Full response:', response);

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setSuccessMessage('Password updated successfully!');
      onSuccess?.({ initialEmail });
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

  const isEmailStage = stage === 'email';
  const isSecurityStage = stage === 'security';
  const isPasswordStage = stage === 'password';
  const isResetDisabled = loading || !newPassword || !confirmPassword || newPassword !== confirmPassword;
  const isVerifyEmailDisabled = loading || !initialEmail.trim() || !emailRegex.test(initialEmail);
  const isVerifyAnswerDisabled = loading || !securityAnswer.trim();

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
              value={initialEmail}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter your email address"
              disabled={loading || !isEmailStage}
            />
          </div>

          {isSecurityStage && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Security Question</label>
                <p className={styles.securityQuestionText}>{securityQuestion}</p>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Security Answer</label>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  className={styles.input}
                  placeholder="Enter your answer"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {isPasswordStage && (
            <>
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
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className={styles.togglePassword}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
            </>
          )}
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
          {isEmailStage && (
            <button
              type="button"
              onClick={handleVerifyEmail}
              className={styles.submitButton}
              disabled={isVerifyEmailDisabled}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          )}
          {isSecurityStage && (
            <button
              type="button"
              onClick={handleVerifyAnswer}
              className={styles.submitButton}
              disabled={isVerifyAnswerDisabled}
            >
              {loading ? 'Verifying...' : 'Verify Answer'}
            </button>
          )}
          {isPasswordStage && (
            <button
              type="button"
              onClick={handleResetPassword}
              className={styles.submitButton}
              disabled={isResetDisabled}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          )}
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