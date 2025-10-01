import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Models.module.css';

const GradeFeedbackmodel = ({ isOpen, onClose, projectId, onSubmit, initialGrade = '', initialFeedback = '' }) => {
  const [grade, setGrade] = useState(String(initialGrade));
  const [feedback, setFeedback] = useState(initialFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync state with props when they change
  useEffect(() => {
    setGrade(String(initialGrade)); // Convert to string for input compatibility
    setFeedback(initialFeedback);
  }, [initialGrade, initialFeedback]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!grade.trim() || !feedback.trim()) {
      setError('Grade and feedback are required.');
      return;
    }

    // Validate grade: allow letter grades (e.g., A, B+, 85) or numbers
    let parsedGrade = grade.trim();
    if (!isNaN(grade) && grade !== '') {
      parsedGrade = parseInt(grade, 10); // Convert to integer for backend
      if (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100) {
        setError('Grade must be a number between 0 and 100.');
        return;
      }
    } else if (!/^[A-F][+-]?$/.test(grade.trim())) {
      setError('Grade must be a valid letter grade (e.g., A, B+, C) or a number between 0 and 100.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({ grade: parsedGrade, feedback: feedback.trim() });
      // Do not reset fields here; let the parent component handle updates via props
      onClose();
    } catch (error) {
      console.error('Error submitting grade and feedback:', error);
      setError('Failed to submit grade and feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modelOverlay} onClick={onClose}>
      <div className={styles.modelContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modelHeader}>
          <h2 className={styles.modelTitle}>Grade & Feedback</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close model">
            &times;
          </button>
        </div>

        <div className={styles.modelBody}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <div className={styles.formGroup}>
            <label htmlFor="grade" className={styles.label}>
              Grade
            </label>
            <input
              id="grade"
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Enter grade (e.g., A, 85, etc.)"
              className={`${styles.input} ${error ? styles.error : ''}`}
              aria-label="Project grade"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="feedback" className={styles.label}>
              Feedback
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback for the project..."
              rows="8"
              className={`${styles.textarea} ${error ? styles.error : ''}`}
              aria-label="Project feedback"
            />
            <p className={styles.charCount}>{feedback.length} characters</p>
          </div>

          <div className={styles.modelFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={styles.submitButton}
              disabled={isSubmitting || !grade.trim() || !feedback.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes for validation
GradeFeedbackmodel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialGrade: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.oneOf([null])]),
  initialFeedback: PropTypes.string,
};

GradeFeedbackmodel.defaultProps = {
  initialGrade: '',
  initialFeedback: '',
};

export default GradeFeedbackmodel;