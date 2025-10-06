import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './RoleDashboards.module.css';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('project-description');
  const [projectData, setProjectData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [documentsByTask, setDocumentsByTask] = useState({});
  const [expandedSections, setExpandedSections] = useState({ myTasks: false, projectTasks: false, links: false });
  const [myTasks, setMyTasks] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState({});
  const [userTaskAssignments, setUserTaskAssignments] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState({});
  const [loadingChat, setLoadingChat] = useState(false);
  const [links, setProjectLinks] = useState([]);
  const [error, setError] = useState('');
  const isProjectGraded = projectData?.grade && projectData?.feedback;
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = location.state || {};
  const chatContainerRef = useRef(null);
  const prevMessageCountRef = useRef(0);

  // Helper function for CHAT
  function getGradientColors(senderName) {
    const colors = [
      '#3b82f6, #1d4ed8', // Blue
      '#10b981, #059669', // Green
      '#f59e0b, #d97706', // Amber
      '#ef4444, #dc2626', // Red
      '#8b5cf6, #7c3aed', // Purple
      '#06b6d4, #0891b2', // Cyan
      '#f97316, #ea580c', // Orange
      '#ec4899, #db2777', // Pink
    ];

    // Generate a consistent index based on the sender name
    let hash = 0;
    for (let i = 0; i < senderName.length; i++) {
      hash = senderName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  const toggleSectionExpansion = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));


  // Effect to scroll to the latest message when chatMessages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Fetch project data on component mount
  useEffect(() => {
    if (projectId) {
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
  }, [projectId, navigate]);

  // Fetch chat messages function
  const fetchChat = useCallback(async () => {
    setLoadingChat(true);
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

      const response = await axios.get(`${API_BASE_URL}/api/getprojectchat/?project_id=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const serverMessages = response.data.messages || [];
      setChatMessages(prev => {
        const nonTempMessages = prev.filter(msg => {
          return !(msg.id && typeof msg.id === 'string' && msg.id.startsWith('temp-'));
        });
        if (JSON.stringify(nonTempMessages) !== JSON.stringify(serverMessages)) {
          return serverMessages;
        }
        return prev;
      });
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      if (err.response?.status === 400) {
        setError('Project ID is required');
      } else if (err.response?.status === 404) {
        setError('Project not found');
      } else if (err.response?.status === 403) {
        setError('Access denied to this project');
      } else if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else {
        setError('Failed to fetch chat messages');
      }
    } finally {
      setLoadingChat(false);
    }
  }, [projectId, navigate]);

  // Polling for chat messages every 5 seconds when Chat tab is active
  useEffect(() => {
    if (activeTab === 'chat' && projectId) {
      fetchChat();
    }
  }, [activeTab, projectId, navigate, fetchChat]);

  // Handle sending chat message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const messageContent = messageInput.trim();
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender_name: 'You',
      role: 'Student',
      sent_at: new Date().toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/, '$3-$2-$1 $4')
    };

    setChatMessages(prev => [...prev, tempMessage]);
    setMessageInput('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      await axios.post(`${API_BASE_URL}/api/sendchatmessage/`, {
        project_id: projectId,
        content: messageContent
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

    } catch (err) {
      console.error('Error sending chat message:', err);
      setChatMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setMessageInput(messageContent);

      if (err.response?.status === 400) {
        setError('Invalid input');
      } else if (err.response?.status === 404) {
        setError('Project not found');
      } else if (err.response?.status === 403) {
        setError('Access denied to this project');
      } else if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else {
        setError('Failed to send message');
      }
    }
  };

  const fetchLinks = useCallback(async () => {
    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.post(`${API_BASE_URL}/api/getprojectlinks/`, {projectId});
      setProjectLinks(response.data.links || []);
    } catch (err) {
      console.error('Error fetching links:', err);
    }
  }, [projectId, setProjectLinks]);

  useEffect(() => {
    if (activeTab === 'tasks' && projectId) {
      fetchLinks();
    }
  }, [activeTab, projectId, fetchLinks]);

  // Redirect if no projectId
  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard');
    }
  }, [projectId, navigate]);

  // Fetch tasks when Tasks tab is clicked
  const fetchUserTaskAssignments = useCallback(async () => {
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

      const assignmentLookup = {};
      response.data.tasks.forEach(task => {
        assignmentLookup[task.task_id] = true;
      });

      setUserTaskAssignments(assignmentLookup);
    } catch (err) {
      console.error('Error fetching user task assignments:', err);
    }
  }, [navigate]);

  const fetchTasks = useCallback(async () => {
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
  }, [projectId, navigate, fetchUserTaskAssignments]);

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

          const response = await axios.post(`${API_BASE_URL}/api/getmembers/`, { projectId }, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setMembers(response.data.members || []);
        } catch (err) {
          console.error('Error fetching members:', err);
          if (err.response?.status === 400) {
            setError('Project ID is required');
          } else if (err.response?.status === 404) {
            setError('Project not found');
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

  const handleCompleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      await axios.post(`${API_BASE_URL}/api/completetask/`, { task_id: taskId, task_status: 'Completed' }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchTasks();
      await fetchUserTaskAssignments(); // Refresh the user task assignments
      setError('Task marked as complete.');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error(`Error marking task ${taskId} as complete:`, err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else if (err.response?.status === 404) {
        setError('Task not found');
      } else if (err.response?.status === 403) {
        setError('Access denied to this task');
      } else {
        setError('Failed to mark task as complete');
      }
    }
  };

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

  useEffect(() => {
    if (activeTab === 'tasks' && projectId) {
      fetchTasks();
    }
  }, [activeTab, projectId, fetchTasks]);

  useEffect(() => {
    const myTasksList = tasks.filter(task => userTaskAssignments[task.task_id] && task.task_name !== "Final Submission");
    const projectTasksList = tasks.filter(task => !userTaskAssignments[task.task_id] && task.task_name !== "Final Submission");
    setMyTasks(myTasksList);
    setProjectTasks(projectTasksList);
  }, [tasks, userTaskAssignments]);

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
      setTimeout(() => setError(''), 3000);
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
  const handleFileSelect = (taskId, event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(taskId, file);
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

      fetchDocuments(taskId);
      setError('Document deleted successfully.');
      setTimeout(() => setError(''), 3000);
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

      console.log(`Downloading document: ${documentTitle}`);

      const response = await axios.get(`${API_BASE_URL}/api/document-download/?document_id=${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      let filename = documentTitle;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^'";\r\n]*)['"]?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }

      const contentType = response.headers['content-type'] || 'application/octet-stream';

      console.log('Download details:', {
        filename,
        contentType,
        size: response.data.size,
        headers: response.headers
      });

      const blob = new Blob([response.data], {
        type: contentType
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      console.log(`Successfully downloaded: ${filename}`);
    } catch (err) {
      console.error('Download error:', err);

      if (err.response) {
        const status = err.response.status;
        if (status === 404) {
          setError('Document not found');
        } else if (status === 403) {
          setError('Access denied to this document');
        } else if (status === 401) {
          localStorage.removeItem('access_token');
          navigate('/');
        } else {
          setError('Failed to download document');
        }
      } else {
        setError('Network error during download');
      }
    }
  };

  // Toggle task expansion
  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks((prev) => {
      const isExpanded = prev[taskId];
      if (!isExpanded && !documentsByTask[taskId]) {
        fetchDocuments(taskId);
      }
      return { ...prev, [taskId]: !isExpanded };
    });
  };

  const tabs = [
    {
      id: 'project-description',
      label: 'Project Description',
      content: (
        <div className={styles.tabContent}>
          <h2 className={styles.tabHeading}>Project Description</h2>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          {loadingProject ? (
            <div className={styles.loadingMessage}>
              Loading project data...
            </div>
          ) : projectData ? (
            <div className={styles.projectDetails}>
              <h3 className={styles.detailHeading}>{projectData.project_name}</h3>
              <p className={styles.detailDescription}>{projectData.project_description}</p>
              <div className={styles.projectInfo}>
                <p className={styles.infoItem}>
                  <strong>Due Date:</strong> {projectData.due_date}
                </p>
                <p className={styles.infoItem}>
                  <strong>Created On:</strong> {projectData.created_on}
                </p>
                <p className={styles.infoItem}>
                  <strong>Feedback:</strong> {projectData.feedback || 'No feedback yet'}
                </p>
                <p className={styles.infoItem}>
                  <strong>Grade:</strong> {projectData.grade || 'Not graded yet'}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.noDataMessage}>
              No project data available.
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
          {/* My Tasks Section */}
          <div className={styles.section}>
            <div
              className={`${styles.sectionHeader} ${expandedSections.myTasks ? styles.sectionHeaderExpanded : ''}`}
              onClick={() => toggleSectionExpansion('myTasks')}
            >
              <h2 className={styles.sectionHeading}>My Tasks</h2>
              <span className={`${styles.dropdownToggle} ${expandedSections.myTasks ? styles.dropdownToggleActive : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.myTasks && (
              <div className={styles.sectionContent}>
                {loadingTasks ? (
                  <div className={styles.loadingMessage}>
                    Loading tasks...
                  </div>
                ) : myTasks.length === 0 ? (
                  <div className={styles.noDataMessage}>
                    No tasks assigned to you.
                  </div>
                ) : (
                  <div className={styles.taskList}>
                    {myTasks.map((task) => (
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
                        <div
                          className={`${styles.taskHeader} ${expandedTasks[task.task_id] ? styles.taskHeaderExpanded : ''}`}
                          onClick={() => toggleTaskExpansion(task.task_id)}
                        >
                          <div className={styles.taskInfo}>
                            <h4 className={styles.taskName}>{task.task_name}</h4>
                            <p className={styles.taskDescription}>{task.task_description || 'No description available.'}</p>
                            <p className={styles.taskMeta}>
                              <strong>Due:</strong> {task.task_due_date} | <strong>Status:</strong> {task.task_status} | <strong>Priority:</strong> {task.task_priority}
                            </p>
                          </div>
                          <div className={styles.taskActions}>
                            {userTaskAssignments[task.task_id] && task.task_status !== 'Completed' && task.task_status !== 'Finalized' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteTask(task.task_id);
                                }}
                                className={styles.deleteButton}
                              >
                                Mark as Complete
                              </button>
                            )}
                            <span className={`${styles.dropdownToggle} ${expandedTasks[task.task_id] ? styles.dropdownToggleActive : ''}`}>
                              ▼
                            </span>
                          </div>
                        </div>
                        {expandedTasks[task.task_id] && (
                          <div className={styles.taskDetails}>
                            {userTaskAssignments[task.task_id] && task.task_status !== 'Completed' && task.task_status !== 'Finalized' && (
                              <div className={styles.uploadContainer}>
                                <label
                                  htmlFor={`file-upload-${task.task_id}`}
                                  className={styles.uploadButton}
                                >
                                  Upload Document
                                </label>
                                <input
                                  id={`file-upload-${task.task_id}`}
                                  type="file"
                                  className={styles.fileInput}
                                  onChange={(e) => handleFileSelect(task.task_id, e)}
                                />
                              </div>
                            )}
                            <h4 className={styles.documentsHeading}>Documents</h4>
                            {loadingDocuments[task.task_id] ? (
                              <p className={styles.documentsLoading}>Loading documents...</p>
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
                                    <div className={styles.documentInfo}>
                                      <span className={styles.documentTitle}>{doc.document_title}</span>
                                      {userTaskAssignments[task.task_id] && task.task_status !== 'Completed' && task.task_status !== 'Finalized' && (
                                        <span
                                          onClick={() => handleDeleteDocument(doc.document_id, task.task_id)}
                                          className={styles.removeDocument}
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
                              <p className={styles.noDocuments}>No documents available.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Project Tasks Section */}
          <div className={styles.section}>
            <div
              className={`${styles.sectionHeader} ${expandedSections.projectTasks ? styles.sectionHeaderExpanded : ''}`}
              onClick={() => toggleSectionExpansion('projectTasks')}
            >
              <h2 className={styles.sectionHeading}>Project Tasks</h2>
              <span className={`${styles.dropdownToggle} ${expandedSections.projectTasks ? styles.dropdownToggleActive : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.projectTasks && (
              <div className={styles.sectionContent}>
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}
                {loadingTasks ? (
                  <div className={styles.loadingMessage}>
                    Loading tasks...
                  </div>
                ) : projectTasks.length === 0 ? (
                  <div className={styles.noDataMessage}>
                    No other tasks available for this project.
                  </div>
                ) : (
                  <div className={styles.taskList}>
                    {projectTasks.map((task) => (
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
                        <div
                          className={`${styles.taskHeader} ${expandedTasks[task.task_id] ? styles.taskHeaderExpanded : ''}`}
                          onClick={() => toggleTaskExpansion(task.task_id)}
                        >
                          <div className={styles.taskInfo}>
                            <h4 className={styles.taskName}>{task.task_name}</h4>
                            <p className={styles.taskDescription}>{task.task_description || 'No description available.'}</p>
                            <p className={styles.taskMeta}>
                              Due: {task.task_due_date} | Status: {task.task_status} | Priority: {task.task_priority}
                            </p>
                          </div>
                          <div className={styles.taskActions}>
                            {userTaskAssignments[task.task_id] && task.task_status !== 'Completed' && task.task_status !== 'Finalized' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteTask(task.task_id);
                                }}
                                className={styles.deleteButton}
                              >
                                Mark as Complete
                              </button>
                            )}
                            <span className={`${styles.dropdownToggle} ${expandedTasks[task.task_id] ? styles.dropdownToggleActive : ''}`}>
                              ▼
                            </span>
                          </div>
                        </div>
                        {expandedTasks[task.task_id] && (
                          <div className={styles.taskDetails}>
                            {userTaskAssignments[task.task_id] && task.task_status !== 'Completed' && task.task_status !== 'Finalized' && (
                              <div className={styles.uploadContainer}>
                                <label
                                  htmlFor={`file-upload-${task.task_id}`}
                                  className={styles.uploadButton}
                                >
                                  Upload Document
                                </label>
                                <input
                                  id={`file-upload-${task.task_id}`}
                                  type="file"
                                  className={styles.fileInput}
                                  onChange={(e) => handleFileSelect(task.task_id, e)}
                                />
                              </div>
                            )}
                            <h4 className={styles.documentsHeading}>Documents</h4>
                            {loadingDocuments[task.task_id] ? (
                              <p className={styles.documentsLoading}>Loading documents...</p>
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
                                    <div className={styles.documentInfo}>
                                      <span className={styles.documentTitle}>{doc.document_title}</span>
                                      {userTaskAssignments[task.task_id] && task.task_status !== 'Completed' && task.task_status !== 'Finalized' && (
                                        <span
                                          onClick={() => handleDeleteDocument(doc.document_id, task.task_id)}
                                          className={styles.removeDocument}
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
                              <p className={styles.noDocuments}>No documents available.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Important Links for Project Section */}
          <div className={styles.section}>
            <div
              className={`${styles.sectionHeader} ${expandedSections.links ? styles.sectionHeaderExpanded : ''}`}
              onClick={() => toggleSectionExpansion('links')}
            >
              <h2 className={styles.sectionHeading}>Important Links for the Project</h2>
              <span className={`${styles.dropdownToggle} ${expandedSections.links ? styles.dropdownToggleActive : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.links && (
              <div className={styles.sectionContent}>
                <div className={styles.linksList}>
                  {links && links.length > 0 ? (
                    <ul>
                      {links.map((link) => (
                        <li key={link.id} className={styles.linkItem}>
                          <a href={link.link_url} target="_blank" rel="noopener noreferrer">{link.link_name || link.link_url}</a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={styles.noDataMessage}>
                      No links available.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'chat',
      label: 'Chat',
      content: (
        <div key="chat-stable" className={styles.chatContainer}>
          <h2 className={styles.tabHeading}>Project Chat</h2>
          {error && (
            <div className={styles.chatError}>
              {error}
            </div>
          )}
          {loadingChat ? (
            <div className={styles.chatLoading}>
              <div className={styles.spinner}></div>
              <div>Loading chat...</div>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className={styles.noMessages}>
              <div className={styles.chatIcon}>💬</div>
              <div className={styles.noMessagesTitle}>No messages yet</div>
              <div className={styles.noMessagesText}>Start the conversation with your team!</div>
            </div>
          ) : (
            <div
              ref={chatContainerRef}
              className={styles.chatMessages}
            >
              {(() => {
                const messagesWithDates = [];
                let prevDate = null;
                chatMessages.forEach((msg, index) => {
                  const [dateStr, timeStr] = msg.sent_at.split(' ');
                  const msgDate = new Date(dateStr);
                  const today = new Date();
                  const diffTime = today - msgDate;
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                  let displayDate;
                  if (diffDays === 0) {
                    displayDate = 'Today';
                  } else if (diffDays === 1) {
                    displayDate = 'Yesterday';
                  } else if (diffDays < 7) {
                    displayDate = msgDate.toLocaleDateString('en-US', { weekday: 'long' });
                  } else {
                    displayDate = msgDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  }

                  if (dateStr !== prevDate) {
                    messagesWithDates.push(
                      <div
                        key={`date-${index}`}
                        className={styles.dateSeparator}
                      >
                        <div className={styles.dateLabel}>{displayDate}</div>
                        <div className={styles.dateLine}></div>
                      </div>
                    );
                    prevDate = dateStr;
                  }

                  const shortTime = timeStr.slice(0, 5);

                  messagesWithDates.push(
                    <div
                      key={msg.id}
                      className={styles.message}
                      onMouseEnter={(e) => {
                        e.currentTarget.classList.add(styles.messageHover);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.classList.remove(styles.messageHover);
                      }}
                    >
                      <div
                        className={styles.avatar}
                        style={{ background: `linear-gradient(135deg, ${getGradientColors(msg.sender_name)})` }}
                      >
                        {msg.sender_name.split(' ')[0].charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.messageContent}>
                        <div className={styles.messageHeader}>
                          <p className={styles.senderName}>
                            {msg.sender_name} <span className={
                              msg.role === 'Supervisor' ? styles.roleSupervisor :
                                msg.role === 'Group Leader' ? styles.roleGroupLeader :
                                  styles.roleDefault
                            }>({msg.role})</span>
                          </p>
                          <span className={styles.messageTime}>{shortTime}</span>
                        </div>
                        <div className={styles.messageBubble}>
                          <p className={styles.messageText}>{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                });
                return messagesWithDates;
              })()}
            </div>
          )}
          {projectData && projectData.grade && projectData.feedback ? null : ( // Use isProjectGraded here
            <div className={styles.chatInputContainer}>
              <input
                type="text"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className={styles.chatInput}
                onFocus={(e) => {
                  e.target.classList.add(styles.chatInputFocus);
                }}
                onBlur={(e) => {
                  e.target.classList.remove(styles.chatInputFocus);
                }}
                disabled={isProjectGraded}
              />
              <button
                onClick={handleSendMessage}
                className={`${styles.sendButton} ${!messageInput.trim() ? styles.sendButtonDisabled : ''}`}
                onMouseEnter={(e) => {
                  if (messageInput.trim()) {
                    e.target.classList.add(styles.sendButtonHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (messageInput.trim()) {
                    e.target.classList.remove(styles.sendButtonHover);
                  }
                }}
                disabled={isProjectGraded || !messageInput.trim()}
              >
                Send
              </button>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'members',
      label: 'Members',
      content: (
        <div className={styles.tabContent}>
          <h2 className={styles.tabHeading}>Team Members</h2>
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
            <div className={styles.noDataMessage}>
              No members found for this project.
            </div>
          ) : (
            <div className={styles.memberContainer}>
              <div className={styles.memberList}>
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
                      <p className={styles.memberName}>{member.first_name} {member.last_name}</p>
                      <p className={styles.memberEmail}>{member.email}</p>
                      <p className={styles.memberRole}>Role: {member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div className={styles.tabWrapper}>
          <div className={styles.tabButtons}>
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                style={{ borderRight: index < tabs.length - 1 ? '1px solid #4b5563' : 'none' }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.classList.add(styles.tabButtonHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.classList.remove(styles.tabButtonHover);
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className={styles.tabContentWrapper}>
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
        onMouseEnter={(e) => {
          e.target.classList.add(styles.backButtonHover);
        }}
        onMouseLeave={(e) => {
          e.target.classList.remove(styles.backButtonHover);
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default StudentDashboard;