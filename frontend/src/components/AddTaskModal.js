import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Assuming axios is used for API calls
import styles from './Models.module.css'; // Import the CSS module

const AddTaskModal = ({ isOpen, onClose, projectId, onSuccess }) => {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskStatus, setTaskStatus] = useState('In Progress');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskMembers, setTaskMembers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch project members when modal opens
  

  const fetchProjectMembers = useCallback(async () => {
  try {
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://127.0.0.1:8000'
      : 'https://pcp-backend-f4a2.onrender.com';
    // Assuming an API endpoint like /api/projects/{projectId}/members/ that returns [{email: 'user@example.com'}, ...]
    const response = await axios.post(`${API_BASE_URL}/api/getmembers/`, { projectId });
    setProjectMembers(response.data.members); // Expecting array of {email: string}
  } catch (err) {
    setError('Failed to load project members');
    console.error(err);
  }
}, [projectId]);
useEffect(() => {
  if (isOpen && projectId) {
    setTaskName('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskStatus('In Progress');
    setTaskPriority('Medium');
    setTaskMembers([]);
    setError('');
    fetchProjectMembers();
  }
}, [isOpen, projectId, fetchProjectMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) {
      setError('Task name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = {
        task_name: taskName,
        task_description: taskDescription,
        task_due_date: taskDueDate,
        task_status: taskStatus,
        task_priority: taskPriority,
        project_id: projectId,
        task_members: taskMembers, // Array of selected emails
      };

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';
      const response = await axios.post(`${API_BASE_URL}/api/addtask/`, formData);
      if (response.status === 201) {
        onSuccess?.(); // Trigger parent refresh on success
        onClose(); // Close modal on success
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (email) => {
    setTaskMembers(prev =>
      prev.includes(email) ? prev.filter(m => m !== email) : [...prev, email]
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modelOverlay}>
      <div className={styles.modelContent}>
        <div className={styles.modelHeader}>
          <h2 className={styles.modelTitle}>Add New Task</h2>
          <button className={styles.closeButton} onClick={onClose} disabled={loading}>
            &times;
          </button>
        </div>
        <div className={styles.modelBody}>
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.TaskUpdateModel__errorMessage}>{error}</div>}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="taskName">Task Name *</label>
              <input
                className={styles.input}
                type="text"
                id="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="taskDescription">Description</label>
              <textarea
                className={styles.textarea}
                id="taskDescription"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="taskDueDate">Due Date</label>
              <input
                className={styles.input}
                type="date"
                id="taskDueDate"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="taskStatus">Status</label>
              <select
                className={styles.input}
                id="taskStatus"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="taskPriority">Priority</label>
              <select
                className={styles.input}
                id="taskPriority"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Assign Members</label>
              <div>
                {projectMembers.length > 0 ? (
                  projectMembers.map((member) => (
                    <label key={member.email} className={styles.label}>
                      <input
                        type="checkbox"
                        value={member.email}
                        checked={taskMembers.includes(member.email)}
                        onChange={() => handleMemberToggle(member.email)}
                      />
                      {member.first_name} {member.last_name} - {member.email}
                    </label>
                  ))
                ) : (
                  <p>Loading members...</p>
                )}
              </div>
            </div>
          </form>
        </div>
        <div className={styles.modelFooter}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;