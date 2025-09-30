import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ProjectDetailsModal.module.css';

const ProjectDetailsModal = ({ isOpen, onClose, projectId, onSubmit, initialName = '', initialDescription = '', initialDueDate = '' }) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync state with props when they change
  useEffect(() => {
    setName(initialName);
    setDescription(initialDescription);
    setDueDate(initialDueDate);
  }, [initialName, initialDescription, initialDueDate]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !dueDate.trim()) {
      setError('Name, description, and due date are required.');
      return;
    }

    // Validate due date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      setError('Due date must be in YYYY-MM-DD format.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit({ name: name.trim(), description: description.trim(), due_date: dueDate.trim() });
      // Do not reset fields here; let the parent component handle updates via props
      onClose();
    } catch (error) {
      console.error('Error submitting project details:', error);
      setError('Failed to submit project details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Update Project Details</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className={`${styles.input} ${error ? styles.error : ''}`}
              aria-label="Project name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description..."
              rows="8"
              className={`${styles.textarea} ${error ? styles.error : ''}`}
              aria-label="Project description"
            />
            <p className={styles.charCount}>{description.length} characters</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dueDate" className={styles.label}>
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`${styles.input} ${error ? styles.error : ''}`}
              aria-label="Project due date"
            />
          </div>

          <div className={styles.modalFooter}>
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
              disabled={isSubmitting || !name.trim() || !description.trim() || !dueDate.trim()}
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
ProjectDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialName: PropTypes.string,
  initialDescription: PropTypes.string,
  initialDueDate: PropTypes.string,
};

ProjectDetailsModal.defaultProps = {
  initialName: '',
  initialDescription: '',
  initialDueDate: '',
};

export default ProjectDetailsModal;