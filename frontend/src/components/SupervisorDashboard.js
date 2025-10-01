import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './RoleDashboards.module.css';
import GradeFeedbackModel from './GradeFeedbackModel';
import ProjectDetailsModel from './ProjectDetailsModel';
import ChangeRoleModel from './ChangeRoleModel';

const SupervisorDashboard = () => {
  const [activeTab, setActiveTab] = useState('project-description');
  const [projectData, setProjectData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [documentsByTask, setDocumentsByTask] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [expandedTasks, setExpandedTasks] = useState({});
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
  const [showGradeModel, setShowGradeModel] = useState(false);
  const [showProjectDetailsModel, setShowProjectDetailsModel] = useState(false);
  const [showChangeRoleModel, setShowChangeRoleModel] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Check if project is graded (both grade and feedback are set)
  const isProjectGraded = projectData?.grade && projectData?.feedback;

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
  };

  // Handle sending chat message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const messageContent = messageInput.trim();
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender_name: 'You',
      role: 'Supervisor',
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

      fetchChat();
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

  // Fetch project data function
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
        setTimeout(() => setError(''), 3000);
      } else if (err.response?.status === 404) {
        setError('Project not found');
        setTimeout(() => setError(''), 3000);
      } else if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else {
        setError('Failed to fetch project data');
        setTimeout(() => setError(''), 3000);
      }
    } finally {
      setLoadingProject(false);
    }
  };

  // For Grade and Feedback Modal
  const handleGradeFeedbackSubmit = async ({ grade, feedback }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      await axios.post(`${API_BASE_URL}/api/updateprojectfeedback/`, {
        project_id: projectId,
        grade: grade,
        feedback: feedback
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh project data to show updated grade/feedback
      await fetchProjectData();
      setActiveTab('review_project');
      setError('Grade and feedback submitted successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error submitting grade and feedback:', err);
      setError('Failed to submit grade and feedback');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  // Handle Project Details Modal Submit
  const handleProjectDetailsSubmit = async ({ name, description, due_date }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      await axios.post(`${API_BASE_URL}/api/updateprojectdetails/`, {
        project_id: projectId,
        name: name,
        description: description,
        due_date: due_date
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh project data to show updated details
      await fetchProjectData();
      setActiveTab('project-description');
      setError('Project details updated successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error updating project details:', err);
      setError('Failed to update project details');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle Change Role Modal Submit
const handleRoleUpdate = async ({ projectId, memberEmail, role }) => {
  // Optimistic local update
  setMembers(prevMembers =>
    prevMembers.map(m =>
      m.email === memberEmail ? { ...m, role } : m
    )
  );
  setShowChangeRoleModel(false);
  
  // Refresh members from server to ensure synced data
  await fetchMembers();
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
      fetchProjectData();
    }
  }, [activeTab, projectId]);

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
        } catch (err) {
          console.error('Error fetching tasks:', err);
          if (err.response?.status === 400) {
            setError('Project ID is required');
            setTimeout(() => setError(''), 3000);
          } else if (err.response?.status === 404) {
            setError('Project not found');
            setTimeout(() => setError(''), 3000);
          } else if (err.response?.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/');
          } else {
            setError('Failed to fetch tasks');
            setTimeout(() => setError(''), 3000);
          }
        } finally {
          setLoadingTasks(false);
        }
      };

      fetchTasks();
    }
  }, [activeTab, projectId]);

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
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingDocuments((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const fetchFinalizedTasks = async () => {
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

      const response = await axios.get(`${API_BASE_URL}/api/getfinalizedtasks/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error('Error fetching finalized tasks:', err);
      if (err.response?.data?.error === 'Not all tasks are finalized') {
        setError('Not all tasks are finalized for this project.');
        setTimeout(() => setError(''), 3000);
      } else if (err.response?.status === 400) {
        setError('Project ID is required.');
        setTimeout(() => setError(''), 3000);
      } else if (err.response?.status === 404) {
        setError('Project not found.');
        setTimeout(() => setError(''), 3000);
      } else if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else {
        setError('Failed to fetch finalized tasks.');
        setTimeout(() => setError(''), 3000);
      }
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'review_project' && projectId) {
      fetchFinalizedTasks();
    }
  }, [activeTab, projectId]);

const handleMemberDelete = async (email) => {
  const memberToDelete = members.find(m => m.email === email);
  if (!memberToDelete) return;

  const supervisors = members.filter(m => m.role === 'Supervisor').length;
  const groupLeaders = members.filter(m => m.role === 'Group Leader').length;

  const newSup = supervisors - (memberToDelete.role === 'Supervisor' ? 1 : 0);
  const newGl = groupLeaders - (memberToDelete.role === 'Group Leader' ? 1 : 0);

  if (newSup < 1 || newGl < 1) {
    setError('Cannot remove member: Project must have at least one Supervisor and one Group Leader');
    setTimeout(() => setError(''), 3000);
    return;
  }

  try {
    const token = localStorage.getItem('access_token');
    const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : 'https://pcp-backend-f4a2.onrender.com';

    await axios.post(`${API_BASE_URL}/api/deleteprojectmember/`, {
      project_id: projectId,
      email: email
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setMembers(prev => prev.filter(m => m.email !== email));
    setError('Member removed successfully');
    setTimeout(() => setError(''), 3000);
  } catch (err) {
    console.error('Error deleting member:', err);
    setError(err.response?.data?.error || 'Failed to remove member');
    setTimeout(() => setError(''), 3000);
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

      setTasks((prev) => prev.filter((task) => task.task_id !== taskId));
      setError('Task deleted successfully.');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error(`Error deleting task ${taskId}:`, err);
      setError('Failed to delete task');
      setTimeout(() => setError(''), 3000);
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
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      if (err.response) {
        const status = err.response.status;
        if (status === 404) {
          setError('Document not found');
          setTimeout(() => setError(''), 3000);
        } else if (status === 403) {
          setError('Access denied to this document');
          setTimeout(() => setError(''), 3000);
        } else if (status === 401) {
          setError('Authentication required');
          setTimeout(() => setError(''), 3000);
          navigate('/');
        } else {
          setError(`Download failed: ${err.response.data?.error || 'Server error'}`);
          setTimeout(() => setError(''), 3000);
        }
      } else if (err.request) {
        setError('Network error - please check your connection');
        setTimeout(() => setError(''), 3000);
      } else {
        setError('Failed to download document');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Toggle task dropdown
  const toggleTaskDropdown = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));

    if (!documentsByTask[taskId] && !loadingDocuments[taskId]) {
      fetchDocuments(taskId);
    }
  };

  // Fetch members when Members tab is clicked
  useEffect(() => {
    if (activeTab === 'members' && projectId) {
      fetchMembers();
    }
  }, [activeTab, projectId, navigate]);
  
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
            setTimeout(() => setError(''), 3000);
          } else if (err.response?.status === 401) {
            localStorage.removeItem('access_token');
            navigate('/');
          } else {
            setError('Failed to fetch members');
            setTimeout(() => setError(''), 3000);
          }
        } finally {
          setLoadingMembers(false);
        }
      };
  const tabs = [
    {
      id: 'project-description',
      label: 'Project Description',
      content: (
        <div className={styles.tabContent}>
          <h2 className={styles.tabHeading}>Project Details</h2>
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
            <div className={styles.noDataMessage}>
              No project details available.
            </div>
          ) : (
            <div className={styles.projectDetails}>
              <div className={styles.detailSection}>
                <h3 className={styles.detailHeading}>Project Name</h3>
                <p className={styles.detailText}>{projectData.project_name || 'N/A'}</p>
              </div>
              <div className={styles.detailSection}>
                <h3 className={styles.detailHeading}>Description</h3>
                <p className={styles.detailDescription}>{projectData.project_description || 'No description provided.'}</p>
              </div>
              <div className={styles.detailRow}>
                <div>
                  <h3 className={styles.detailHeading}>Due Date</h3>
                  <p className={styles.detailText}>{projectData.due_date || 'No due date'}</p>
                </div>
                <div>
                  <h3 className={styles.detailHeading}>Created On</h3>
                  <p className={styles.detailText}>{projectData.created_on || 'N/A'}</p>
                </div>
              </div>
              <div className={styles.detailSection}>
                <h3 className={styles.detailHeading}>Feedback</h3>
                <p className={styles.detailDescription}>{projectData.feedback || 'No feedback provided.'}</p>
              </div>
              <div className={styles.detailSection}>
                <h3 className={styles.detailHeading}>Grade</h3>
                <p className={styles.detailText}>{projectData.grade !== '' ? projectData.grade : 'Not graded'}</p>
              </div>
              {!isProjectGraded && (
                <button
                  className={styles.backButton}
                  onClick={() => setShowProjectDetailsModel(true)}
                >
                  Update Project Details
                </button>
              )}
            </div>
          )}
          <div className={styles.detailSection}>
            <h3 className={styles.detailHeading}>Important Links</h3>
            <p className={styles.detailText}>{'No sharepoint links provided.'}</p>
            <button className={styles.backButton}>Add new Links</button>
          </div>
        </div>
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      content: (
        <div className={styles.tabContent}>
          <h2 className={styles.tabHeading}>Project Tasks</h2>
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
            <div className={styles.noDataMessage}>
              No tasks found for this project.
            </div>
          ) : (
            <div className={styles.taskContainer}>
              <div className={styles.taskList}>
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
                      <div className={styles.taskInfo}>
                        <p className={styles.taskName}>{task.task_name}</p>
                        <p className={styles.taskDescription}>{task.task_description}</p>
                        <p className={styles.taskMeta}>
                          Due: {task.task_due_date} | Status: {task.task_status} | Priority: {task.task_priority}
                        </p>
                        {task.task_status !== 'Finalized' && (
                          <button className={styles.deleteButton} onClick={() => handleDelete(task.task_id)}>
                            Delete Task
                          </button>
                        )}
                      </div>
                      <div
                        className={`${styles.dropdownToggle} ${expandedTasks[task.task_id] ? styles.dropdownToggleActive : ''}`}
                        onClick={() => toggleTaskDropdown(task.task_id)}
                      >
                        ▼
                      </div>
                    </div>
                    {expandedTasks[task.task_id] && (
                      <div className={styles.taskDocuments}>
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
                                <span className={styles.documentTitle}>
                                  {doc.document_title} ({doc.doc_type})
                                </span>
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
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'review_project',
      label: 'Finalized Project',
      content: (
        <div className={styles.tabContent}>
          <h2 className={styles.tabHeading}>Finalized Tasks</h2>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          {loadingTasks ? (
            <div className={styles.loadingMessage}>
              Loading final project...
            </div>
          ) : tasks.length === 0 ? (
            <div className={styles.noDataMessage}>
              Nothing to review yet.
            </div>
          ) : (
            <div className={styles.taskContainer}>
              <div className={styles.taskList}>
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
                      <div className={styles.taskInfo}>
                        <p className={styles.taskName}>{task.task_name}</p>
                        <p className={styles.taskDescription}>{task.task_description}</p>
                        <p className={styles.taskMeta}>
                          Due: {task.task_due_date} | Status: {task.task_status} | Priority: {task.task_priority}
                        </p>
                        <p className={styles.submittedBy}>
                          Submitted by:{' '}
                          {task.assigned_members && task.assigned_members.length > 0 ? (
                            task.assigned_members.map((member, index) => (
                              <span key={index}>
                                {member.fname} {member.lname}
                                {index < task.assigned_members.length - 1 ? ', ' : ''}
                              </span>
                            ))
                          ) : (
                            'N/A'
                          )}
                        </p>
                      </div>
                      <div
                        className={`${styles.dropdownToggle} ${expandedTasks[task.task_id] ? styles.dropdownToggleActive : ''}`}
                        onClick={() => toggleTaskDropdown(task.task_id)}
                      >
                        ▼
                      </div>
                    </div>
                    {expandedTasks[task.task_id] && (
                      <div className={styles.taskDocuments}>
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
                                <span className={styles.documentTitle}>
                                  {doc.document_title} ({doc.doc_type})
                                </span>
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
              <button
                className={styles.addTaskButton}
                onClick={() => setShowGradeModel(true)}
              >
                Provide Grade and Feedback
              </button>
            </div>
          )}
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
            <div ref={chatContainerRef} className={styles.chatMessages}>
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
                      <div key={`date-${index}`} className={styles.dateSeparator}>
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
          {!isProjectGraded && (
            <div className={styles.chatInputContainer}>
              <input
                type="text"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className={styles.chatInput}
                disabled={isProjectGraded}
              />
              <button
                onClick={handleSendMessage}
                disabled={isProjectGraded || !messageInput.trim()}
                className={`${styles.sendButton} ${(isProjectGraded || !messageInput.trim()) ? styles.sendButtonDisabled : ''}`}
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
                     {!isProjectGraded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                        <button
                          className={styles.deleteMemberButton}
                          onClick={() => handleMemberDelete(member.email)}
                        >
                          Remove Member
                        </button>
                        <button
                          className={styles.deleteMemberButton}
                          onClick={() => {setSelectedMember(member);setShowChangeRoleModel(true); }}
                        >
                          Change Role
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!isProjectGraded && (
            <button
              className={styles.addMemberButton}
              onClick={() => navigate('/addprojectmembers', { state: { projectId: projectId } })}
            >
              Add Members
            </button>
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
      <GradeFeedbackModel
        isOpen={showGradeModel}
        onClose={() => setShowGradeModel(false)}
        projectId={projectId}
        onSubmit={handleGradeFeedbackSubmit}
        initialGrade={projectData?.grade ?? ''}
        initialFeedback={projectData?.feedback ?? ''}
      />
      <ProjectDetailsModel
        isOpen={showProjectDetailsModel}
        onClose={() => setShowProjectDetailsModel(false)}
        projectId={projectId}
        onSubmit={handleProjectDetailsSubmit}
        initialName={projectData?.project_name ?? ''}
        initialDescription={projectData?.project_description ?? ''}
        initialDueDate={projectData?.due_date ?? ''}
      />
      <ChangeRoleModel
        isOpen={showChangeRoleModel}
        onClose={() => setShowChangeRoleModel(false)}
        projectId={projectId}
        memberEmail={selectedMember?.email}
        onUpdate={handleRoleUpdate}
        initialRole={selectedMember?.role}
      />
      <button
        onClick={() => navigate('/dashboard')}
        className={styles.backButton}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default SupervisorDashboard;