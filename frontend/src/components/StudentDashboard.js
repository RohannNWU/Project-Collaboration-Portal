import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './StudentDashboard.module.css';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('project-description');
  const [projectData, setProjectData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [documentsByTask, setDocumentsByTask] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const [userTaskAssignments, setUserTaskAssignments] = useState({});
  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState({});
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = location.state || {};

  // Redirect if no projectId
  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard');
    }
  }, [projectId, navigate]);

  // Fetch project data when Project Description tab is clicked
  useEffect(() => {
    if (activeTab === 'project-description' && projectId) {
      const fetchProjectData = async () => {
        setLoadingProject(true);
        setError('');
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            navigate('/');
            return;
          }

          const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';

          const response = await axios.get(`${API_BASE_URL}/api/getprojectdata/?project_id=${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setProjectData(response.data.project_data || {});
        } catch (err) {
          console.error('Error fetching project data:', err);
          if (err.response?.status === 400) {
            setError('Project ID is required');
          } else if (err.response?.status === 404) {
            setError('Project not found');
          } else if (err.response?.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/');
          } else {
            setError('Failed to fetch project data');
          }
        } finally {
          setLoadingProject(false);
        }
      };

      fetchProjectData();
    }
  }, [activeTab, projectId, navigate]);

  // Fetch tasks when Tasks tab is clicked
  useEffect(() => {
    if (activeTab === 'tasks' && projectId) {
      const fetchTasks = async () => {
        setLoadingTasks(true);
        setError('');
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            navigate('/');
            return;
          }

          const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';

          const response = await axios.get(`${API_BASE_URL}/api/getprojecttasks/?project_id=${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setTasks(response.data.tasks || []);

          // Also fetch user task assignments
          await fetchUserTaskAssignments();

        } catch (err) {
          console.error('Error fetching tasks:', err);
          if (err.response?.status === 400) {
            setError('Project ID is required');
          } else if (err.response?.status === 404) {
            setError('Project not found');
          } else if (err.response?.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/');
          } else {
            setError('Failed to fetch tasks');
          }
        } finally {
          setLoadingTasks(false);
        }
      };

      fetchTasks();
    }
  }, [activeTab, projectId, navigate]);

  // Fetch documents for a specific task
  const fetchDocuments = async (taskId) => {
    setLoadingDocuments((prev) => ({ ...prev, [taskId]: true }));
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.get(`${API_BASE_URL}/api/gettaskdocuments/?task_id=${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDocumentsByTask((prev) => ({
        ...prev,
        [taskId]: response.data.documents || [],
      }));
    } catch (err) {
      console.error(`Error fetching documents for task ${taskId}:`, err);
      setError('Failed to fetch documents');
    } finally {
      setLoadingDocuments((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  // Fetch user task assignments
  const fetchUserTaskAssignments = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.get(`${API_BASE_URL}/api/getusertasks/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Create a lookup object for quick task assignment checking
      const assignmentLookup = {};
      response.data.tasks.forEach(task => {
        assignmentLookup[task.task_id] = true;
      });

      setUserTaskAssignments(assignmentLookup);
    } catch (err) {
      console.error('Error fetching user task assignments:', err);
    }
  };

  // Handle file upload
  const handleFileUpload = async (taskId, file) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('description', `Uploaded for task: ${tasks.find(t => t.task_id === taskId)?.task_name || 'Unknown Task'}`);
      formData.append('task_id', taskId);

      const response = await axios.post(`${API_BASE_URL}/api/document-upload/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      console.log('File uploaded successfully:', response.data);
      setError('File uploaded successfully!');

      // Refresh documents for this task
      fetchDocuments(taskId);

    } catch (err) {
      console.error('Error uploading file:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else {
        setError('Failed to upload file');
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (taskId) => {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '*/*'; // Adjust accept attribute as needed
    fileInput.style.display = 'none';

    // Add change event listener to handle file selection
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        handleFileUpload(taskId, file);
      }
      // Clean up: remove the input element
      fileInput.remove();
    });

    // Trigger the file input click
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  const handleMemberDelete = async (memberEmail) => {
    if (!window.confirm('Are you sure you want to delete this member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      await axios.delete(`${API_BASE_URL}/api/deleteprojectmember/`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { project_id: projectId, email: memberEmail }
      });

      // Remove the deleted member from state
      setMembers((prev) => prev.filter((member) => member.email !== memberEmail));
      setError('Member deleted successfully.');
    } catch (err) {
      console.error(`Error deleting member ${memberEmail}:`, err);
      setError('Failed to delete member');
    }
  };

  // Handle task deletion
  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      await axios.delete(`${API_BASE_URL}/api/deletetask/${taskId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted task from state
      setTasks((prev) => prev.filter((task) => task.task_id !== taskId));
      setError('Task deleted successfully.');
    } catch (err) {
      console.error(`Error deleting task ${taskId}:`, err);
      setError('Failed to delete task');
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId, taskId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      await axios.delete(`${API_BASE_URL}/api/deletedocument/${documentId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh documents for this task
      fetchDocuments(taskId);
      setError('Document deleted successfully.');
    } catch (err) {
      console.error(`Error deleting document ${documentId}:`, err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else if (err.response?.status === 404) {
        setError('Document not found');
      } else if (err.response?.status === 403) {
        setError('Access denied to this document');
      } else {
        setError('Failed to delete document');
      }
    }
  };

  // Handle document download
  const handleDownload = async (documentId, documentTitle) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      // Show loading state
      console.log(`Downloading document: ${documentTitle}`);

      const response = await axios.get(`${API_BASE_URL}/api/document-download/?document_id=${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // Important: ensure we get blob data
      });

      // Extract filename from Content-Disposition header
      let filename = documentTitle;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        // Handle both quoted and unquoted filenames
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";\r\n]*)['"]?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      // Get content type - this is crucial for proper file association
      const contentType = response.headers['content-type'] || 'application/octet-stream';

      // Debug logging
      console.log('Download details:', {
        filename,
        contentType,
        size: response.data.size,
        headers: response.headers
      });

      // Create blob with explicit MIME type
      const blob = new Blob([response.data], {
        type: contentType
      });

      // Create download URL
      const url = window.URL.createObjectURL(blob);

      // Create and trigger download link
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // This attribute forces download
      link.style.display = 'none'; // Hide the link

      // Add to DOM, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(url);

      console.log(`Successfully downloaded: ${filename}`);

    } catch (err) {
      console.error('Download error:', err);

      // More specific error handling
      if (err.response) {
        const status = err.response.status;
        if (status === 404) {
          setError('Document not found');
        } else if (status === 403) {
          setError('Access denied to this document');
        } else if (status === 401) {
          setError('Authentication required');
          navigate('/');
        } else {
          setError(`Download failed: ${err.response.data?.error || 'Server error'}`);
        }
      } else if (err.request) {
        setError('Network error - please check your connection');
      } else {
        setError('Failed to download document');
      }
    }
  };

  // Toggle task dropdown
  const toggleTaskDropdown = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));

    // Fetch documents if not already fetched
    if (!documentsByTask[taskId] && !loadingDocuments[taskId]) {
      fetchDocuments(taskId);
    }
  };

  // Fetch members when Members tab is clicked
  useEffect(() => {
    if (activeTab === 'members' && projectId) {
      const fetchMembers = async () => {
        setLoadingMembers(true);
        setError('');
        try {
          const token = localStorage.getItem('access_token');
          if (!token) {
            navigate('/');
            return;
          }

          const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';

          const response = await axios.post(
            `${API_BASE_URL}/api/getmembers/`,
            { projectId: projectId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setMembers(response.data.members || []);
        } catch (err) {
          console.error('Error fetching members:', err);
          if (err.response?.status === 400) {
            setError('Project ID is required');
          } else if (err.response?.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/');
          } else {
            setError('Failed to fetch members');
          }
        } finally {
          setLoadingMembers(false);
        }
      };

      fetchMembers();
    }
  }, [activeTab, projectId, navigate]);

  const tabs = [
    {
      id: 'project-description',
      label: 'Project Description',
      content: (
        <div className={styles.tabContent}>
          <h2 className={styles.sectionTitle}>Project Details</h2>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          {loadingProject ? (
            <div className={styles.loadingMessage}>
              Loading project details...
            </div>
          ) : !projectData ? (
            <div className={styles.loadingMessage}>
              No project details available.
            </div>
          ) : (
            <div className={styles.projectCard}>
              <div className={styles.projectField}>
                <h3 className={styles.projectFieldTitle}>Project Name</h3>
                <p className={styles.projectFieldText}>
                  {projectData.project_name || 'N/A'}
                </p>
              </div>
              <div className={styles.projectField}>
                <h3 className={styles.projectFieldTitle}>Description</h3>
                <p className={styles.projectFieldText}>
                  {projectData.project_description || 'No description provided.'}
                </p>
              </div>
              <div className={styles.projectField} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 className={styles.projectFieldTitle}>Due Date</h3>
                  <p className={styles.projectFieldText}>
                    {projectData.due_date || 'No due date'}
                  </p>
                </div>
                <div>
                  <h3 className={styles.projectFieldTitle}>Created On</h3>
                  <p className={styles.projectFieldText}>
                    {projectData.created_on || 'N/A'}
                  </p>
                </div>
              </div>
              <div className={styles.projectField}>
                <h3 className={styles.projectFieldTitle}>Feedback</h3>
                <p className={styles.projectFieldText}>
                  {projectData.feedback || 'No feedback provided.'}
                </p>
              </div>
              <div className={styles.projectField}>
                <h3 className={styles.projectFieldTitle}>Grade</h3>
                <p className={styles.projectFieldText}>
                  {projectData.grade !== '' ? projectData.grade : 'Not graded'}
                </p>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      content: (
        <div className={styles.tabContent}>
          <h2 className={styles.sectionTitle}>Project Tasks</h2>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          {loadingTasks ? (
            <div className={styles.loadingMessage}>
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className={styles.loadingMessage}>
              No tasks found for this project.
            </div>
          ) : (
            <div className={styles.taskList}>
              <div className={styles.taskContainer}>
                {tasks.map((task) => (
                  <div
                    key={task.task_id}
                    className={styles.taskItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.classList.add(styles.taskItemHover);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.classList.remove(styles.taskItemHover);
                    }}
                  >
                    <div className={styles.taskHeader}>
                      <div style={{ flex: 1 }}>
                        <p className={styles.taskTitle}>{task.task_name}</p>
                        <p className={styles.taskDescription}>{task.task_description}</p>
                        <p className={styles.taskMeta}>
                          Due: {task.task_due_date} | Status: {task.task_status} | Priority: {task.task_priority}
                        </p>
                        <div className={styles.taskActions}>
                          <button className={styles.taskButton}>Edit Task</button>
                          <button
                            className={`${styles.taskButton} ${styles.deleteButton}`}
                            onClick={() => handleDelete(task.task_id)}
                          >
                            Delete Task
                          </button>
                          {userTaskAssignments[task.task_id] && (
                            <div style={{ position: 'relative' }}>
                              <button
                                className={`${styles.taskButton} ${styles.uploadButton}`}
                                onClick={() => handleFileSelect(task.task_id)}
                              >
                                Upload File
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className={`${styles.toggleIcon} ${expandedTasks[task.task_id] ? styles.expanded : ''}`}
                        onClick={() => toggleTaskDropdown(task.task_id)}
                      >
                        ▼
                      </div>
                    </div>
                    {expandedTasks[task.task_id] && (
                      <div className={styles.documentList}>
                        <h4 className={styles.documentTitle}>Documents</h4>
                        {loadingDocuments[task.task_id] ? (
                          <p className={styles.loadingMessage}>Loading documents...</p>
                        ) : documentsByTask[task.task_id]?.length > 0 ? (
                          <ul className={styles.documentList}>
                            {documentsByTask[task.task_id].map((doc) => (
                              <li
                                key={doc.document_id}
                                className={styles.documentItem}
                                onMouseEnter={(e) => {
                                  e.currentTarget.classList.add(styles.documentItemHover);
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.classList.remove(styles.documentItemHover);
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span className={styles.documentItemText}>{doc.document_title}</span>
                                  {userTaskAssignments[task.task_id] && (
                                    <span
                                      onClick={() => handleDeleteDocument(doc.document_id, task.task_id)}
                                      className={styles.removeLink}
                                    >
                                      (remove)
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDownload(doc.document_id, doc.document_title)}
                                  className={styles.downloadButton}
                                >
                                  Download
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={styles.loadingMessage}>No documents available.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'chat',
      label: 'Chat',
      content: (
        <div className={styles.tabContent}>
          <h2 className={styles.sectionTitle}>Team Chat</h2>
          <div className={styles.chatContainer}>
            <div className={styles.chatMessageContainer}>
              <div className={styles.chatMessage}>
                <div className={styles.avatar}>A</div>
                <div className={styles.messageContent}>
                  <p className={styles.messageSender}>Alice</p>
                  <p className={styles.messageText}>Hey team, how's the project coming along?</p>
                </div>
              </div>
              {/* Other chat messages */}
            </div>
          </div>
          <div className={styles.chatInputContainer}>
            <input
              type="text"
              placeholder="Type your message..."
              className={styles.chatInput}
            />
            <button className={styles.sendButton}>Send</button>
          </div>
        </div>
      ),
    },
    {
      id: 'members',
      label: 'Members',
      content: (
        <div className={styles.tabContent}>
          <h2 className={styles.sectionTitle}>Team Members</h2>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          {loadingMembers ? (
            <div className={styles.loadingMessage}>
              Loading members...
            </div>
          ) : members.length === 0 ? (
            <div className={styles.loadingMessage}>
              No members found for this project.
            </div>
          ) : (
            <div className={styles.memberList}>
              <div className={styles.memberContainer}>
                {members.map((member) => (
                  <div
                    key={member.email}
                    className={styles.memberItem}
                    onMouseEnter={(e) => {
                      e.currentTarget.classList.add(styles.memberItemHover);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.classList.remove(styles.memberItemHover);
                    }}
                  >
                    <div className={styles.memberAvatar}>
                      {member.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.memberInfo}>
                      <p className={styles.memberName}>
                        {member.first_name} {member.last_name}
                      </p>
                      <p className={styles.memberEmail}>{member.email}</p>
                      <p className={styles.memberRole}>Role: {member.role}</p>
                    </div>
                    <button
                      className={styles.deleteMemberButton}
                      onClick={() => handleMemberDelete(member.email)}
                    >
                      Delete Member
                    </button>
                  </div>
                ))}
              </div>
              <button
                className={styles.addMemberButton}
                onClick={() => navigate('/addprojectmembers', { state: { projectId: projectId } })}
              >
                Add Members
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.tabContainer}>
          <div className={styles.tabList}>
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                style={{ borderRight: index < tabs.length - 1 ? '1px solid #4b5563' : 'none' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className={styles.tabContent}>
            {tabs.map((tab) => (
              activeTab === tab.id && (
                <div key={tab.id}>
                  {tab.content}
                </div>
              )
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate('/dashboard')}
        className={styles.backButton}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default StudentDashboard;