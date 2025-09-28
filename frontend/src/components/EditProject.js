import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import styles from './EditProject.module.css';

const EditProject = () => {
  const [user, setUser] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);
  const [memberName, setMemberName] = useState('');
  const [taskMembers, setTaskMembers] = useState([]);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : 'https://pcp-backend-f4a2.onrender.com';

  useEffect(() => {
    const fetchMembers = async () => {
      if (projectId) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/getmembers/`, { projectId });
          setProjectMembers(response.data.members || []);
        } catch (error) {
          console.error('Error fetching members:', error);
          setProjectMembers([]);
        }
      }
    };

    fetchMembers();
  }, [projectId, API_BASE_URL]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = jwtDecode(token);
        setUser(payload.user_email);
      } catch (error) {
        console.error('Error decoding JWT:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }

    if (location.state?.projectId && location.state?.projectName) {
      setProjectId(location.state.projectId);
      setProjectName(location.state.projectName);
    }
  }, [navigate, location]);

  const handleInputChange = (event) => {
    setMemberName(event.target.value);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (memberName.trim()) {
      setTaskMembers([memberName, ...taskMembers]);
      setMemberName('');
    }
  };

  const handleAddTask = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/addtask/`,
        {
          project_id: projectId,
          task_name: event.target.taskName.value,
          task_description: event.target.taskDescription.value,
          task_due_date: event.target.taskDueDate.value,
          task_status: event.target.taskStatus.value,
          task_priority: event.target.taskPriority.value,
          task_members: taskMembers
        });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data.error || 'Failed to add task');
    }
  };

  return (
    <div className={styles.editProjectContainer}>
      <h1 className={styles.projectTitle}>Add Tasks to {projectName}</h1>
      <small className={styles.userInfo}>{user} viewing project</small>
      <h2 className={styles.assignTasksTitle}>Assign Tasks</h2>
      <form className={styles.taskForm} onSubmit={handleAddTask}>
        <label className={styles.formLabel}>Task Name:</label>
        <input
          type="text"
          name="taskName"
          placeholder="Task Name"
          required
          className={styles.textInput}
        />
        <label className={styles.formLabel}>Task Description:</label>
        <textarea
          placeholder="Task Description"
          name="taskDescription"
          rows={8}
          required
          className={styles.formTextarea}
        />
        <label className={styles.formLabel}>Task Due Date:</label>
        <input
          type="date"
          name="taskDueDate"
          required
          className={styles.textInput}
        />
        <label className={styles.formLabel}>Task Status:</label>
        <select name="taskStatus" className={styles.formSelect}>
          <option>-- Select Status --</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <label className={styles.formLabel}>Task Priority:</label>
        <select name="taskPriority" className={styles.formSelect}>
          <option>-- Select Priority --</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <label className={styles.formLabel}>Assign Members:</label>
        <div className={styles.memberInputGroup}>
          <select
            name="members"
            value={memberName}
            onChange={handleInputChange}
            className={styles.formSelect}
          >
            <option>-- Select Member --</option>
            {projectMembers.length > 0 ? (
              projectMembers.map((member, index) => (
                <option key={index} value={member.email}>
                  {index + 1}. {member.first_name} - {member.email}
                </option>
              ))
            ) : (
              <option disabled>No members available</option>
            )}
          </select>
          <button type="button" onClick={handleAddMember} className={styles.addMemberBtn}>
            Add Member
          </button>
        </div>
        <label className={styles.formLabel}>Task Members:</label>
        <textarea
          rows={8}
          value={taskMembers.join('; \n')}
          disabled
          className={styles.formTextarea}
        />
        <button type="submit" className={styles.submitTaskBtn}>
          Add Task
        </button>
        {message && (
          <p className={`${styles.formMessage} ${message.includes('Failed') ? styles.formMessageError : styles.formMessageSuccess}`}>
            {message}
          </p>
        )}
      </form>
      <button
        className={styles.backToDashboardBtn}
        onClick={() => navigate('/dashboard')}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default EditProject;