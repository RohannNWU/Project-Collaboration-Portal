import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const EditProject = () => {
  const [user, setUser] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectMembers, setProjectMembers] = useState([]); // Initialize as empty array
  const [memberName, setMemberName] = useState('');
  const [taskMembers, setTaskMembers] = useState([]);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : 'https://pcp-backend-f4a2.onrender.com';

  // Fetch project members when projectName changes
  useEffect(() => {
    const fetchMembers = async () => {
      if (projectId) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/getmembers/`, { projectId });
          setProjectMembers(response.data.members || []);
        } catch (error) {
          console.error('Error fetching members:', error);
          setProjectMembers([]); // Fallback to empty array on error
        }
      }
    };

    fetchMembers();
  }, [projectId, API_BASE_URL]); // Run when projectId changes

  // Handle token and projectName initialization
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

    // Get project data from navigation state
    if (location.state?.projectID && location.state?.projectName) {
      setProjectId(location.state.projectID);
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
        setMessage(response.data.message)
    } catch (error) {
      setMessage(error.response?.data.error || 'Failed to add task')
    }
  };

  return (
    <div>
      <h1>Edit Project: {projectName}</h1>
      <small>{user} viewing project</small>
      <br />
      <br />
      <h2>Assign Tasks</h2>
      <br />
      <form onSubmit={handleAddTask}>
        <label>Task Name:</label>
        <br />
        <input
          type="text"
          name="taskName"
          placeholder="Task Name"
          required
        />
        <br />
        <label>Task Description:</label>
        <br />
        <textarea
          placeholder="Task Description"
          name="taskDescription"
          rows={8}
          required
        />
        <br />
        <label>Task Due Date:</label>
        <br />
        <input
          type="date"
          name="taskDueDate"
          required
        />
        <br />
        <br />
        <label>Task Status:</label>
        <br />
        <select name="taskStatus">
          <option>-- Select Status --</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <br />
        <br />
        <label>Task Priority:</label>
        <br />
        <select name="taskPriority">
          <option>-- Select Priority --</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <br />
        <br />
        <label>Assign Members:</label>
        <br />
        <select placeholder="Select members" name="members" value={memberName} onChange={handleInputChange}>
          <option>-- Select Member --</option>
          {projectMembers.length > 0 ? (
            projectMembers.map((member, index) => (
              <option key={index} value={member.email}>
                {index + 1 + '. ' + member.first_name + ' - ' + member.email}
              </option>
            ))
          ) : (
            <option disabled>No members available</option>
          )}
        </select>
        <button onClick={handleAddMember}>
          Add Member
        </button>
        <br />
        <br />
        <label>Task Members:</label>
        <br />
        <textarea
          type="text"
          rows={8}
          value={taskMembers.join('; \n')}
          disabled
        />
        <br />
        <br />
        <button type="submit">
          Add Task
        </button>
        <p>{message}</p>
      </form>
      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default EditProject;