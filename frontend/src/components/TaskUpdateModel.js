import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import styles from './Models.module.css';

const formatDateToYYYYMMDD = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
};

const TaskDetails = ({ taskName, setTaskName, taskDescription, setTaskDescription, dueDate, setDueDate }) => (
  <div className={styles.TaskUpdateModel__modelBody}>
    <div className={styles.TaskUpdateModel__formGroup}>
      <label className={styles.TaskUpdateModel__label}>Task Name</label>
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className={styles.TaskUpdateModel__input}
        placeholder="Enter task name"
      />
    </div>
    <div className={styles.TaskUpdateModel__formGroup}>
      <label className={styles.TaskUpdateModel__label}>Task Description</label>
      <textarea
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
        className={styles.TaskUpdateModel__textarea}
        placeholder="Enter task description"
        rows="4"
      />
    </div>
    <div className={styles.TaskUpdateModel__formGroup}>
      <label className={styles.TaskUpdateModel__label}>Due Date</label>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className={styles.TaskUpdateModel__input}
      />
    </div>
  </div>
);

const ProjectMembers = ({ projectMembers, taskMembers, onAddMember }) => {
  const [selectedMemberEmail, setSelectedMemberEmail] = useState('');

  const availableMembers = projectMembers.filter(
    (projectMember) =>
      !taskMembers.some((taskMember) => taskMember.email === projectMember.email)
  );

  useEffect(() => {
    console.log('ProjectMembers:', projectMembers);
    console.log('TaskMembers:', taskMembers);
  }, [projectMembers, taskMembers]);

  return (
    <div className={styles.TaskUpdateModel__modelBody}>
      <div className={styles.TaskUpdateModel__formGroup}>
        <label className={styles.TaskUpdateModel__label}>Add Project Members</label>
        <select
          name="projectmembers"
          value={selectedMemberEmail}
          onChange={(e) => setSelectedMemberEmail(e.target.value)}
          className={styles.TaskUpdateModel__input}
        >
          <option value="">-- Select Member to Add --</option>
          {availableMembers.length > 0 ? (
            availableMembers.map((member, index) => (
              <option key={index} value={member.email}>
                {index + 1}. {member.first_name} {member.last_name} - {member.email}
              </option>
            ))
          ) : (
            <option disabled>No members available</option>
          )}
        </select>
        <button
          type="button"
          onClick={() => onAddMember(selectedMemberEmail)}
          className={styles.TaskUpdateModel__submitButton}
          style={{marginTop: '20px'}}
          disabled={!selectedMemberEmail}
        >
          Add Member
        </button>
      </div>
    </div>
  );
};

const TaskMembers = ({ taskMembers, onRemoveMember }) => {
  const [selectedMemberEmail, setSelectedMemberEmail] = useState('');

  return (
    <div className={styles.TaskUpdateModel__modelBody}>
      <div className={styles.TaskUpdateModel__formGroup}>
        <label className={styles.TaskUpdateModel__label}>Remove Task Members</label>
        <select
          name="taskmembers"
          value={selectedMemberEmail}
          onChange={(e) => setSelectedMemberEmail(e.target.value)}
          className={styles.TaskUpdateModel__input}
        >
          <option value="">-- Select Member to Remove --</option>
          {taskMembers.length > 0 ? (
            taskMembers.map((member, index) => (
              <option key={index} value={member.email}>
                {index + 1}. {member.first_name} {member.last_name}
              </option>
            ))
          ) : (
            <option disabled>No members available</option>
          )}
        </select>
        <button
          type="button"
          onClick={() => onRemoveMember(selectedMemberEmail)}
          className={styles.TaskUpdateModel__submitButton}
          style={{marginTop: '20px'}}
          disabled={!selectedMemberEmail}
        >
          Remove Member
        </button>
      </div>
    </div>
  );
};

ProjectMembers.propTypes = {
  projectMembers: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  taskMembers: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onAddMember: PropTypes.func.isRequired,
};

TaskMembers.propTypes = {
  taskMembers: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemoveMember: PropTypes.func.isRequired,
};

TaskDetails.propTypes = {
  taskName: PropTypes.string.isRequired,
  setTaskName: PropTypes.func.isRequired,
  taskDescription: PropTypes.string.isRequired,
  setTaskDescription: PropTypes.func.isRequired,
  dueDate: PropTypes.string.isRequired,
  setDueDate: PropTypes.func.isRequired,
};

const TaskUpdateModel = ({ isOpen, onClose, projectId, taskId, onUpdate, initialName = '', initialDescription = '', initialDueDate = '' }) => {
  const [taskName, setTaskName] = useState(initialName);
  const [taskDescription, setTaskDescription] = useState(initialDescription);
  const [dueDate, setDueDate] = useState(formatDateToYYYYMMDD(initialDueDate));
  const [projectMembers, setProjectMembers] = useState([]);
  const [taskMembers, setTaskMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
  console.log('TaskUpdateModel props:', { taskId, projectId, initialName, initialDescription, initialDueDate });
  if (!taskName && !taskDescription && !dueDate) {
    setTaskName(initialName);
    setTaskDescription(initialDescription);
    setDueDate(formatDateToYYYYMMDD(initialDueDate));
  }
}, [initialName, initialDescription, initialDueDate, taskName, taskDescription, dueDate, projectId, taskId]);

  

  const fetchProjectMembers = async (projectId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to continue');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.post(
        `${API_BASE_URL}/api/getmembers/`,
        { projectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProjectMembers(response.data.members || []);
    } catch (error) {
      console.error('Error fetching project members:', error);
      setError('Failed to fetch project members');
    }
  };

  const fetchTaskMembers = async (taskId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to continue');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.post(
        `${API_BASE_URL}/api/gettaskmembers/`,
        { taskId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTaskMembers(response.data.task_members || []);
    } catch (error) {
      console.error('Error fetching task members:', error);
      setError('Failed to fetch task members');
    }
  };

  const fetchTaskDetails = useCallback(async (taskId) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Please log in to continue');
      return;
    }

    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://127.0.0.1:8000'
      : 'https://pcp-backend-f4a2.onrender.com';

    const response = await axios.post(
      `${API_BASE_URL}/api/gettaskdetails/?task_id=${taskId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Task details response:', response.data);
    setTaskName(response.data.task_name || initialName);
    setTaskDescription(response.data.task_description || initialDescription);
    setDueDate(formatDateToYYYYMMDD(response.data.task_due_date) || initialDueDate);
  } catch (error) {
    console.error('Error fetching task details:', error);
    setError('Failed to fetch task details');
  }
}, [initialName, initialDescription, initialDueDate]);

useEffect(() => {
  if (isOpen && taskId) {
    fetchProjectMembers(projectId);
    fetchTaskMembers(taskId);
    fetchTaskDetails(taskId);
    setLoading(false);
  }
}, [isOpen, projectId, taskId, fetchTaskDetails]);

  const handleAddMember = async (email) => {
    if (!email) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to continue');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      await axios.post(
        `${API_BASE_URL}/api/addtaskmember/`,
        { taskId, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTaskMembers(taskId);
      fetchProjectMembers(projectId);
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Failed to add member');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRemoveMember = async (email) => {
    if (!email) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to continue');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      await axios.post(
        `${API_BASE_URL}/api/removetaskmember/`,
        { taskId, email },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      fetchTaskMembers(taskId);
      fetchProjectMembers(projectId);
    } catch (error) {
      console.error('Error removing member:', error);
      setError('Failed to remove member');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateTask = async () => {
    try {
      if (!taskId) {
        setError('Task ID is missing');
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

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      console.log('Updating task with:', { taskId, taskName, taskDescription, dueDate });

      const response = await axios.post(
        `${API_BASE_URL}/api/updatetaskdetails/`,
        {
          task_id: taskId,
          task_name: taskName,
          task_description: taskDescription,
          due_date: formatDateToYYYYMMDD(dueDate),
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        onUpdate({ taskId, taskName, taskDescription, dueDate });
        onClose();
      } else {
        setError('Failed to update task');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.response?.data?.error || 'Failed to update task');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.TaskUpdateModel__modelOverlay} onClick={onClose}>
      <div className={styles.TaskUpdateModel__modelContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.TaskUpdateModel__modelHeader}>
          <h2 className={styles.TaskUpdateModel__modelTitle}>Update Task</h2>
          <button onClick={onClose} className={styles.TaskUpdateModel__closeButton} aria-label="Close modal">
            &times;
          </button>
        </div>
        {error && <div className={styles.TaskUpdateModel__errorMessage}>{error}</div>}
        
        {/* Tab Navigation */}
        <div className={styles.TaskUpdateModel__tabContainer}>
          <nav className={styles.TaskUpdateModel__tabNav}>
            <button
              className={`${styles.TaskUpdateModel__tabButton} ${activeTab === 'details' ? styles.TaskUpdateModel__tabButtonActive : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Task Details
            </button>
            <button
              className={`${styles.TaskUpdateModel__tabButton} ${activeTab === 'add' ? styles.TaskUpdateModel__tabButtonActive : ''}`}
              onClick={() => setActiveTab('add')}
            >
              Add Members
            </button>
            <button
              className={`${styles.TaskUpdateModel__tabButton} ${activeTab === 'remove' ? styles.TaskUpdateModel__tabButtonActive : ''}`}
              onClick={() => setActiveTab('remove')}
            >
              Remove Members
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'details' && (
            <TaskDetails
              taskName={taskName}
              setTaskName={setTaskName}
              taskDescription={taskDescription}
              setTaskDescription={setTaskDescription}
              dueDate={dueDate}
              setDueDate={setDueDate}
            />
          )}
          {activeTab === 'add' && (
            <ProjectMembers
              projectMembers={projectMembers}
              taskMembers={taskMembers}
              onAddMember={handleAddMember}
            />
          )}
          {activeTab === 'remove' && (
            <TaskMembers
              taskMembers={taskMembers}
              onRemoveMember={handleRemoveMember}
            />
          )}
        </div>

        <div className={styles.TaskUpdateModel__modelFooter}>
          <button
            type="button"
            onClick={onClose}
            className={styles.TaskUpdateModel__cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          {activeTab === 'details' && (
            <button
              type="button"
              onClick={handleUpdateTask}
              className={styles.TaskUpdateModel__submitButton}
              disabled={loading || !taskName}
            >
              {loading ? 'Updating...' : 'Update Task'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

TaskUpdateModel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  taskId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onUpdate: PropTypes.func.isRequired,
  initialName: PropTypes.string,
  initialDescription: PropTypes.string,
  initialDueDate: PropTypes.string,
};

TaskUpdateModel.defaultProps = {
  initialName: '',
  initialDescription: '',
  initialDueDate: '',
};

export default TaskUpdateModel;