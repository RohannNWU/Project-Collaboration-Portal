import React, { useState, useEffect, useRef } from 'react';
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
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState({});
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = location.state || {};
  const chatContainerRef = useRef(null);

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

  // Effect to scroll to the latest message when chatMessages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Fetch chat messages when Chat tab is clicked
  useEffect(() => {
    if (activeTab === 'chat' && projectId) {
      fetchChat();
    }
  }, [activeTab, projectId, navigate]);

  // Fetch chat messages function
  const fetchChat = async () => {
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
        // Filter out temporary messages and replace with server messages
        const nonTempMessages = prev.filter(msg => {
          // Safe check: ensure id exists and is a string before calling startsWith
          return !(msg.id && typeof msg.id === 'string' && msg.id.startsWith('temp-'));
        });
        if (JSON.stringify(nonTempMessages) !== JSON.stringify(serverMessages)) {
          return serverMessages;
        }
        return prev;
      });
      //setChatMessages(response.data.messages || []);
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
  };

  // Handle sending chat message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const messageContent = messageInput.trim();
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender_name: 'You',
      role: 'Student', // You might want to get the actual user role from your auth system
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

    // Optimistically add the message to UI
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

      // Refresh chat messages to get the server's version
      fetchChat();
    } catch (err) {
      console.error('Error sending chat message:', err);

      // Remove the optimistic message on error
      setChatMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setMessageInput(messageContent); // Restore the message input

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
        <div key="chat-stable" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          height: '600px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          overflow: 'hidden',
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#1e293b',
            textAlign: 'center',
            textShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            Project Chat
          </h2>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '1rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                border: '1px solid #fecaca',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              {error}
            </div>
          )}

          {loadingChat ? (
            <div style={{
              textAlign: 'center',
              color: '#64748b',
              padding: '2rem',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              <div style={{
                display: 'inline-block',
                width: '2rem',
                height: '2rem',
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
              }}></div>
              <div>Loading chat...</div>
            </div>
          ) : chatMessages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#64748b',
              padding: '3rem',
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '2px dashed #cbd5e1'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem',
                opacity: '0.6'
              }}>💬</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                No messages yet
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                Start the conversation with your team!
              </div>
            </div>
          ) : (
            <div
              ref={chatContainerRef}
              style={{
                flex: '1 1 0',
                overflowY: 'auto',
                paddingRight: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                padding: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0',
                scrollBehavior: 'smooth',
                minHeight: '0', // Important: allows flex item to shrink
                position: 'relative' // Create stacking context
              }}
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
                        style={{
                          textAlign: 'center',
                          margin: '1.5rem 0',
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          display: 'inline-block',
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          padding: '0.5rem 1.5rem',
                          borderRadius: '2rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          border: '1px solid #e2e8f0',
                          flexShrink: 0, // Prevent input area from shrinking
                          position: 'relative',
                          zIndex: 1
                        }}>
                          {displayDate}
                        </div>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '0',
                          right: '0',
                          height: '1px',
                          backgroundColor: '#e2e8f0',
                          zIndex: 0
                        }}></div>
                      </div>
                    );
                    prevDate = dateStr;
                  }

                  const shortTime = timeStr.slice(0, 5);
                  const isCurrentUser = msg.sender_name === 'You'; // You'll need to determine this based on your user data

                  messagesWithDates.push(
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        borderRadius: '0.75rem',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          background: `linear-gradient(135deg, ${getGradientColors(msg.sender_name)})`,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '600',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                          border: '2px solid #ffffff'
                        }}
                      >
                        {msg.sender_name.split(' ')[0].charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.25rem'
                        }}>
                          <p style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#1e293b',
                            margin: 0
                          }}>
                            {msg.sender_name} <span style={{
                              color: msg.role === 'Supervisor' ? '#dc2626' : msg.role === 'Group Leader' ? '#10b981' : '#94a3b8'
                            }}>({msg.role})</span>
                          </p>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            fontWeight: '500'
                          }}>
                            {shortTime}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#ffffff',
                            padding: '0.75rem 1rem',
                            borderRadius: '1rem 1rem 1rem 0.25rem',
                            maxWidth: '85%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #f1f5f9',
                            position: 'relative',
                            wordBreak: 'break-word'
                          }}
                        >
                          <p style={{
                            fontSize: '0.9rem',
                            color: '#334155',
                            margin: 0,
                            lineHeight: '1.5'
                          }}>
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                });
                return messagesWithDates;
              })()}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <input
              type="text"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.75rem',
                outline: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                backgroundColor: '#f8fafc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              style={{
                padding: '0.75rem 1.5rem',
                background: messageInput.trim()
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : '#e2e8f0',
                color: messageInput.trim() ? 'white' : '#94a3b8',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                boxShadow: messageInput.trim()
                  ? '0 4px 12px rgba(59, 130, 246, 0.4)'
                  : 'none',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (messageInput.trim()) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (messageInput.trim()) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }
              }}
            >
              Send
            </button>
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