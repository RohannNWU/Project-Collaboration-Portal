import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './RoleDashboards.module.css';
import GradeFeedbackModel from './GradeFeedbackModel';
import ProjectDetailsModel from './ProjectDetailsModel';
import ChangeRoleModel from './ChangeRoleModel';
import AddMemberModal from './AddMemberModal';
import CreateMeetingModal from './CreateMeetingModal';
import AddNewLinkModal from './AddNewLinkModal';

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
  const [userContributions, setUserContributions] = useState([]);
  const [loadingContributions, setLoadingContributions] = useState(false);
  const [contributionsError, setContributionsError] = useState('');
  const [isProjectGraded, setIsProjectGraded] = useState(false);
  const [showGradeModel, setShowGradeModel] = useState(false);
  const [links, setProjectLinks] = useState([]);
  const [loadingChat] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = location.state || {};
  const chatContainerRef = useRef(null);
  const [taskMembers, setTaskMembers] = useState({});
  const [showProjectDetailsModel, setShowProjectDetailsModel] = useState(false);
  const [showChangeRoleModel, setShowChangeRoleModel] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [finalTask, setFinalTask] = useState(null);
  const [finalDocuments, setFinalDocuments] = useState([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ links: false, meetings: false });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const isTempId = (id) => typeof id === 'string' && id.startsWith('temp-');
  const toggleSectionExpansion = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

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

  const getApiConfig = (token) => {
    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://127.0.0.1:8000'
      : 'https://pcp-backend-f4a2.onrender.com';

    return {
      baseURL: API_BASE_URL,
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  const fetchTaskMembers = useCallback(async (taskId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.get(`${API_BASE_URL}/api/gettaskmembers/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTaskMembers((prev) => ({
        ...prev,
        [taskId]: response.data.members || [],
      }));
    } catch (err) {
      console.error(`Error fetching members for task ${taskId}:`, err);
    }
  }, [navigate]);

  // Effect to scroll to the latest message when chatMessages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const fetchLinks = useCallback(async () => {
    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.post(`${API_BASE_URL}/api/getprojectlinks/`, { projectId });
      setProjectLinks(response.data.links || []);
    } catch (err) {
      console.error('Error fetching links:', err);
    }
  }, [projectId, setProjectLinks]);

  useEffect(() => {
    if (activeTab === 'project-description' && projectId) {
      fetchLinks();
    }
  }, [activeTab, projectId, fetchLinks]);

  const fetchUserContributions = useCallback(async () => {
    setError('');
    setLoadingContributions(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.get(`${API_BASE_URL}/api/getcontributions/`, {
        params: { projectId },
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserContributions(response.data.contributors || []);  // Fallback to empty array
    } catch (err) {
      console.error('Error fetching contributions:', err);
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
        setError('Failed to fetch contributions');
      }
      setUserContributions([]);  // Clear on error
    } finally {
      setLoadingContributions(false);
    }
  }, [projectId, navigate]);

  useEffect(() => {
    if (activeTab === 'review_project' && projectId) {
      fetchUserContributions();
    }
  }, [activeTab, projectId, fetchUserContributions]);

  // Fetch chat messages
  const fetchChat = useCallback(async () => {
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL =
        window.location.hostname === 'localhost'
          ? 'http://127.0.0.1:8000'
          : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.get(
        `${API_BASE_URL}/api/getprojectchat/?project_id=${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const serverMessages = response.data.messages || [];

      setChatMessages(prev => {
        // filter out local temp messages in prev
        const prevFiltered = prev.filter(msg => !isTempId(msg?.id));

        // update only if lengths differ (lightweight check)
        if (serverMessages.length !== prevFiltered.length) {
          return serverMessages;
        }
        return prev;
      });
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else {
        setError('Failed to fetch chat messages');
        setTimeout(() => setError(''), 3000);
      }
    }
  }, [projectId, navigate]);

  // Chat polling - refresh every 5 seconds
  useEffect(() => {
    if (activeTab === 'chat' && projectId) {
      // Immediate fetch
      fetchChat();

      // Poll every 5s
      const intervalId = setInterval(() => {
        fetchChat();
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [activeTab, projectId, fetchChat]);

  // Handle sending chat message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const messageContent = messageInput.trim();
    const tempId = `temp-${Date.now()}`;
    setMessageInput('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL =
        window.location.hostname === 'localhost'
          ? 'http://127.0.0.1:8000'
          : 'https://pcp-backend-f4a2.onrender.com';

      await axios.post(
        `${API_BASE_URL}/api/sendchatmessage/`,
        { project_id: projectId, content: messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // fetch updated messages from server
      fetchChat();
    } catch (err) {
      console.error('Error sending chat message:', err);
      // remove temp message if send failed
      setChatMessages(prev => prev.filter(msg => msg?.id !== tempId));
      setMessageInput(messageContent);
      setError('Failed to send message');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Fetch project data function
  const fetchProjectData = useCallback(async () => {
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
      setIsProjectGraded(!!response.data.project_data?.grade && response.data.project_data?.grade !== '');
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
  }, [projectId, navigate]);

  // For Grade and Feedback Modal
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

      //Submit grade and feedback using your real endpoint
      await axios.post(`${API_BASE_URL}/api/updateprojectfeedback/`, {
        project_id: projectId,
        grade: grade,
        feedback: feedback
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      //Refresh and show success ---
      await fetchProjectData();
      setActiveTab('review_project');
      setError('Grade and feedback submitted successfully!');
      setTimeout(() => setError(''), 3000);

      //Fetch all members of the project
      let projectMembers = [];
      try {
        const membersResponse = await axios.post(
          `${API_BASE_URL}/api/getmembers/`,
          { projectId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        projectMembers = (membersResponse.data?.members || []).map((m) => m.email).filter(Boolean);
      } catch (fetchErr) {
        console.error('Error fetching project members before notification:', fetchErr);
      }

      //Notify all members except the grader (current supervisor)
      if (projectMembers.length > 0) {
        try {
          const payload = JSON.parse(window.atob(token.split('.')[1]));
          const supervisorEmail = payload.email || payload.user_email || payload.sub || 'Unknown user';

          //Exclude the supervisor themself
          const filteredRecipients = projectMembers.filter((email) => email !== supervisorEmail);

          if (filteredRecipients.length > 0) {
            await axios.post(
              `${API_BASE_URL}/api/createnotification/`,
              {
                emails: filteredRecipients,
                title: 'Project Graded',
                message: `${supervisorEmail} graded your project "${projectData?.project_name || 'Unknown Project'}" and provided feedback.`,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch (notifErr) {
          console.error('Error sending project graded notifications:', notifErr);
        }
      }
    } catch (err) {
      console.error('Error submitting grade and feedback:', err);
      setError('Failed to submit grade and feedback');
      setTimeout(() => setError(''), 3000);
    }
  };


  // Fetch documents for a specific task
  const fetchDocuments = useCallback(async (taskId) => {
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
  }, [navigate]);

  // Sample fetch for contributions (add this function)
  const fetchContributions = useCallback(async (projectId) => {
    setLoadingContributions(true);
    setContributionsError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.get(`${API_BASE_URL}/api/getcontributions/`, {
        params: { projectId },
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserContributions(response.data.contributors || []);
      setIsProjectGraded(response.data.is_graded || false);  // Assuming API returns this
    } catch (err) {
      console.error('Error fetching contributions:', err);
      setContributionsError('Failed to load contributions');
    } finally {
      setLoadingContributions(false);
    }
  }, []);

  // Updated fetchFinalSubmission (add case-insensitivity)
  const fetchFinalSubmission = useCallback(async () => {
    if (!projectId) return;
    setLoadingTasks(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      setLoadingTasks(false);
      return;
    }
    try {
      const config = getApiConfig(token);
      const response = await axios.get(`${config.baseURL}/api/getprojecttasks/?project_id=${projectId}`, { ...config });
      const allTasks = response.data.tasks || [];
      const finalTaskData = allTasks.find(task => task.task_name?.toLowerCase() === 'final submission');  // Case-insensitive
      setFinalTask(finalTaskData || null);
      setTasks(allTasks);  // If needed for other tabs

      if (finalTaskData) {
        const docs = await fetchDocuments(finalTaskData.task_id);
        setFinalDocuments(docs);
      } else {
        setFinalDocuments([]);
      }

      // Fetch contributions and grade status (sample API; adjust endpoint)
      await fetchContributions(projectId);
    } catch (err) {
      console.error('Error fetching final submission:', err);
      setError('Failed to fetch final submission');
      setTimeout(() => setError(''), 3000);
      setFinalDocuments([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [projectId, navigate, fetchDocuments, fetchContributions]);

  // Updated useEffect to trigger on new tab ID
  useEffect(() => {
    if ((activeTab === 'final-submission' || activeTab === 'review_project') && projectId) {
      fetchFinalSubmission();
    }
  }, [activeTab, projectId, fetchFinalSubmission]);

  // Handle Project Details Modal Submit
  const handleProjectDetailsSubmit = async ({ name, description, due_date }) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL =
        window.location.hostname === 'localhost'
          ? 'http://127.0.0.1:8000'
          : 'https://pcp-backend-f4a2.onrender.com';

      // --- Step 1: Update the project details ---
      await axios.post(
        `${API_BASE_URL}/api/updateprojectdetails/`,
        {
          project_id: projectId,
          name,
          description,
          due_date,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // --- Step 2: Refresh UI ---
      await fetchProjectData();
      setActiveTab('project-description');
      setError('Project details updated successfully!');
      setTimeout(() => setError(''), 3000);

      // --- Step 3: Fetch all project members ---
      let projectMembers = [];
      try {
        const membersResponse = await axios.post(
          `${API_BASE_URL}/api/getmembers/`,
          { projectId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        projectMembers = (membersResponse.data?.members || []).map((m) => m.email).filter(Boolean);
      } catch (fetchErr) {
        console.error('Error fetching project members for notification:', fetchErr);
      }

      // --- Step 4: Notify all members except the supervisor who made the change ---
      if (projectMembers.length > 0) {
        try {
          const payload = JSON.parse(window.atob(token.split('.')[1]));
          const supervisorEmail = payload.email || payload.user_email || payload.sub || 'Unknown user';

          // Remove the current supervisor's email
          const filteredRecipients = projectMembers.filter((email) => email !== supervisorEmail);

          if (filteredRecipients.length > 0) {
            await axios.post(
              `${API_BASE_URL}/api/createnotification/`,
              {
                emails: filteredRecipients,
                title: 'Project Details Updated',
                message: `${supervisorEmail} updated the details of project "${name}". Please review the latest description and due date.`,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } catch (notifErr) {
          console.error('Error sending project update notifications:', notifErr);
        }
      }
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
  }, [activeTab, projectId, navigate, fetchProjectData]);

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
  }, [activeTab, projectId, navigate]);

  useEffect(() => {
    if (activeTab === 'review_project' && projectId) {
      const fetchCompletedTasks = async () => {
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

          // Use getprojecttasks to get all tasks and filter for finalized final submission
          const response = await axios.get(`${API_BASE_URL}/api/getprojecttasks/?project_id=${projectId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const allTasks = response.data.tasks || [];
          // Filter for tasks that are finalized and match final submission name (case-insensitive)
          const finalizedTasks = allTasks.filter(task =>
            task.task_status === 'Finalized' &&
            task.task_name?.toLowerCase().includes('final submission')
          );
          const finalTaskData = finalizedTasks.find(task =>
            task.task_name?.toLowerCase() === 'final submission'
          ) || finalizedTasks[0]; // Fallback to first finalized if exact not found
          setFinalTask(finalTaskData || null);
          setTasks(finalizedTasks); // Set only finalized tasks

          if (finalTaskData) {
            const docs = await fetchDocuments(finalTaskData.task_id);
            setFinalDocuments(docs);
          } else {
            setFinalDocuments([]);
          }

        } catch (err) {
          console.error('Error fetching completed tasks:', err);
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
            setError('Failed to fetch completed tasks');
            setTimeout(() => setError(''), 3000);
          }
          setFinalDocuments([]);
        } finally {
          setLoadingTasks(false);
        }
      };

      fetchCompletedTasks();
    }
  }, [activeTab, projectId, navigate, fetchDocuments]);

  useEffect(() => {
    if (finalTask) {
      setFinalDocuments(documentsByTask[finalTask.task_id] || []);
    }
  }, [finalTask, documentsByTask, fetchDocuments]);

  //Remove member from project with role constraints
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
      const API_BASE_URL =
        window.location.hostname === 'localhost'
          ? 'http://127.0.0.1:8000'
          : 'https://pcp-backend-f4a2.onrender.com';

      // Decode JWT to get the email of the logged-in user
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const loggedInEmail = payload.email || payload.user_email || payload.sub || 'Unknown user';

      // Step 1: Remove member from the project
      await axios.post(
        `${API_BASE_URL}/api/deleteprojectmember/`,
        {
          project_id: projectId,
          email: email
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Step 2: Notify the removed member
      await axios.post(
        `${API_BASE_URL}/api/createnotification/`,
        {
          emails: [email],
          title: 'Removed from Project',
          message: `${loggedInEmail} removed you from project "${projectData?.project_name}".`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Step 3: Update members state
      setMembers(prev => prev.filter(m => m.email !== email));
      setError('Member removed successfully');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error deleting member:', err);
      setError(err.response?.data?.error || 'Failed to remove member');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteLink = async (linkId, projectId) => {
    if (!window.confirm('Are you sure you want to delete this link?')) {
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

      await axios.post(`${API_BASE_URL}/api/deleteprojectlink/`, { linkId, projectId }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchLinks(); // Refresh the links list
      setError('Link deleted successfully.');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error(`Error deleting link ${linkId}:`, err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else if (err.response?.status === 404) {
        setError('Link not found');
      } else if (err.response?.status === 403) {
        setError('Access denied to this link');
      } else {
        setError('Failed to delete link');
      }
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
    setExpandedTasks((prev) => {
      const isExpanded = prev[taskId];
      if (!isExpanded && !documentsByTask[taskId]) {
        fetchDocuments(taskId);
      }
      if (!isExpanded && !taskMembers[taskId]) {
        fetchTaskMembers(taskId);
      }
      return { ...prev, [taskId]: !isExpanded };
    });
  };

  // Fetch members when Members tab is clicked
  const fetchMembers = useCallback(async () => {
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
  }, [projectId, navigate]);
  useEffect(() => {
    if (activeTab === 'members' && projectId) {
      fetchMembers();
    }
  }, [activeTab, projectId, navigate, fetchMembers]);

  // Fetch meetings
  const fetchMeetings = useCallback(async () => {
    setLoadingMeetings(true);
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

      const response = await axios.get(`${API_BASE_URL}/api/getprojectmeetings/?project_id=${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMeetings(response.data.meetings || []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
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
        setError('Failed to fetch meetings');
        setTimeout(() => setError(''), 3000);
      }
    } finally {
      setLoadingMeetings(false);
    }
  }, [projectId, navigate]);

  //Role management helpers
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  const getApiBase = () =>
    window.location.hostname === 'localhost'
      ? 'http://127.0.0.1:8000'
      : 'https://pcp-backend-f4a2.onrender.com';

  const fetchUserRole = useCallback(async () => {
    try {
      setRoleLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return null;
      }

      // Decode JWT to get user's email
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      const userEmail = payload.email || payload.user_email || payload.sub;

      if (!userEmail) {
        console.error('Could not extract email from token');
        setError('Failed to verify user role');
        return null;
      }

      const response = await axios.post(
        `${getApiBase()}/api/getmembers/`,
        { projectId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const members = response.data.members || [];
      const currentUser = members.find((m) => m.email === userEmail);

      if (!currentUser) {
        console.warn('User not found in project members');
        setError('Failed to verify user role');
        return null;
      }

      // Normalize role (lowercase for comparison)
      const newRole = currentUser.role?.trim();
      const oldRole = userRole?.trim();

      // Alert if role changed
      if (oldRole && newRole && oldRole !== newRole) {
        alert('Your role changed for this project.');
      }

      setUserRole(newRole);
      return newRole;
    } catch (err) {
      console.error('Error fetching user role:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else {
        setError('Failed to verify user role');
      }
      setUserRole(null);
      return null;
    } finally {
      setRoleLoading(false);
    }
  }, [navigate, projectId, userRole]);

  // Ensure the user is a Supervisor before executing handler.
  const ensureSupervisor = useCallback(
    async (handler) => {
      if (typeof handler !== 'function') {
        console.warn('ensureSupervisor expects a function as the handler');
        return;
      }

      let roleToCheck = userRole;

      // If we don't know the role yet, fetch it first
      if (!roleToCheck && !roleLoading) {
        roleToCheck = await fetchUserRole();
      }

      if (!roleToCheck) {
        setError('Failed to verify user role');
        return;
      }

      const normalizedRole = roleToCheck.trim().toLowerCase();

      // Supervisors can execute handlers
      if (normalizedRole === 'supervisor') {
        try {
          return await handler();
        } catch (err) {
          console.error('Error running protected handler:', err);
        }
      }
      else if (normalizedRole === 'student') {
        navigate('/studentdashboard', { state: { projectId } });
      } else if (normalizedRole === 'group leader' || normalizedRole === 'groupleader') {
        navigate('/groupleaderdashboard', { state: { projectId } });
      } else {
        setError('Failed to verify user role');
      }
    },
    [userRole, roleLoading, fetchUserRole, navigate, projectId]
  );

  // Define tabs
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
                  onClick={() => ensureSupervisor(() => setShowProjectDetailsModel(true))}
                >
                  Update Project Details
                </button>
              )}
            </div>
          )}
          <div className={styles.section}>
            <div
              className={`${styles.sectionHeader} ${expandedSections.links ? styles.sectionHeaderExpanded : ''}`}
              onClick={() => ensureSupervisor(() => toggleSectionExpansion('links'))}
            >
              <h3 className={styles.sectionHeading}>Important Links</h3>
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
                          <span
                            onClick={() => ensureSupervisor(() => handleDeleteLink(link.link_id, link.project_id))}
                            className={styles.removeDocument}
                          >
                            (remove)
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className={styles.noDataMessage}>
                      No links available.
                    </div>
                  )}
                </div>
                <button
                  className={styles.addTaskButton}
                  onClick={() => ensureSupervisor(() => setShowLinkModal(true))}
                >
                  Add Link
                </button>
              </div>
            )}
          </div>
          <div className={styles.section}>
            <h2>Project Meetings</h2>
            <div
              className={`${styles.sectionHeader} ${expandedSections.meetings ? styles.sectionHeaderExpanded : ''}`}
              onClick={() => ensureSupervisor(() => {
                const willExpand = !expandedSections.meetings;
                toggleSectionExpansion('meetings');
                if (willExpand && !meetings.length && !loadingMeetings) {
                  fetchMeetings();
                }
              })}
            >
              <h3 className={styles.sectionHeading}>Upcoming Meetings</h3>
              <span className={`${styles.dropdownToggle} ${expandedSections.meetings ? styles.dropdownToggleActive : ''}`}>
                ▼
              </span>
            </div>
            {expandedSections.meetings && (
              <div className={styles.sectionContent}>
                {loadingMeetings ? (
                  <div className={styles.loadingMessage}>Loading meetings...</div>
                ) : meetings.length > 0 ? (
                  <ul className={styles.meetingsList}>
                    {meetings.map((meeting) => (
                      <li key={meeting.id} className={styles.meetingItem}>
                        <h4 className={styles.meetingTitle}>{meeting.meeting_title || 'Untitled Meeting'}</h4>
                        <p className={styles.meetingDate}>Date: {meeting.date || 'N/A'}</p>
                        <p className={styles.meetingDate}>Time: {meeting.time || 'N/A'}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.noDataMessage}>
                    No meetings scheduled.
                  </div>
                )}
              </div>
            )}
            <button className={styles.backButton} onClick={(e) => {
              e.stopPropagation();
              ensureSupervisor(() => setShowCreateMeetingModal(true));
            }}>
              Create New Meeting
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      content: (
        <div className={styles.tabContent}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
          <h2 className={styles.tabHeading}>Project Tasks</h2>
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
                {tasks
                  .filter((task) => task.task_name !== 'Final Submission')
                  .map((task) => (
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
                        </div>
                        <div
                          className={`${styles.dropdownToggle} ${expandedTasks[task.task_id] ? styles.dropdownToggleActive : ''}`}
                          onClick={() => ensureSupervisor(() => toggleTaskDropdown(task.task_id))}
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
                                    {doc.document_title}
                                  </span>
                                  <button
                                    onClick={() => ensureSupervisor(() => handleDownload(doc.document_id, doc.document_title))}
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
          {error && <div className={styles.errorMessage}>{error}</div>}
          <h2 className={styles.tabHeading}>Finalized Project</h2>
          {loadingTasks ? (
            <div className={styles.loadingMessage}>Loading finalized project...</div>
          ) : !finalTask ? (
            <div className={styles.noDataMessage}>No Final Submission submitted yet.</div>
          ) : (
            <div>
              <div className={styles.taskInfo}>
                <h3>{finalTask.task_name}</h3>
                <p><strong>Description:</strong> {finalTask.task_description}</p>
                <p><strong>Due Date:</strong> {finalTask.task_due_date}</p>
                <p><strong>Status:</strong> {finalTask.task_status}</p>
              </div>
              {/* Documents List */}
              <div className={styles.documentsSection}>
                <h4>Final Submission Documents</h4>
                {(finalDocuments || []).length === 0 ? (
                  <p className={styles.noDocuments}>No documents available.</p>
                ) : (
                  <ul className={styles.documentList}>
                    {(finalDocuments || []).map((doc) => (
                      <li key={doc.document_id} className={styles.documentItem}>
                        <span className={styles.documentTitle}>{doc.document_title}</span>
                        <button
                          onClick={() => ensureSupervisor(() => handleDownload(doc.document_id, doc.document_title))}
                          className={styles.downloadButton}
                        >
                          Download
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3>Contributions</h3>
                {loadingContributions ? (
                  <p>Loading contributions...</p>
                ) : contributionsError ? (
                  <p className={styles.errorMessage}>{contributionsError}</p>
                ) : (userContributions || []).length === 0 ? (
                  <p>No contributors found.</p>
                ) : (
                  <ul>
                    {(userContributions || []).map((contributor, index) => (
                      <li key={contributor.email || index}>
                        {contributor.first_name} {contributor.last_name} - ({contributor.email})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                className={styles.addTaskButton}
                onClick={() => ensureSupervisor(() => setShowGradeModel(true))}
                disabled={isProjectGraded}
              >
                {isProjectGraded ? 'Project Graded' : 'Provide Grade and Feedback'}
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
          {error && (
            <div className={styles.chatError}>
              {error}
            </div>
          )}
          <h2 className={styles.tabHeading}>Project Chat</h2>
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
                onClick={() => ensureSupervisor(handleSendMessage)}
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
                          onClick={() => ensureSupervisor(() => handleMemberDelete(member.email))}
                        >
                          Remove Member
                        </button>
                        <button
                          className={styles.deleteMemberButton}
                          onClick={() => ensureSupervisor(() => { setSelectedMember(member); setShowChangeRoleModel(true); })}
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
              onClick={() => ensureSupervisor(() => setShowAddMemberModal(true))}
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
                onClick={() => ensureSupervisor(() => setActiveTab(tab.id))}
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
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          fetchMembers()
        }}
        projectId={projectId}
        projectName={projectData?.project_name}
      />
      <CreateMeetingModal
        isOpen={showCreateMeetingModal}
        onClose={() => {setShowCreateMeetingModal(false); fetchMeetings();}}
        projectId={projectId}
        dueDate={projectData?.due_date}  // e.g., from fetched project data
      />
      {showGradeModel && (
        <GradeFeedbackModel  // Assuming component exists
          isOpen={showGradeModel}
          onClose={() => setShowGradeModel(false)}
          projectId={projectId}
          onSubmit={handleGradeFeedbackSubmit}
          onSuccess={() => {
            fetchProjectData();  // Refresh grade/feedback
            setShowGradeModel(false);
          }}
        />
      )}
      {showLinkModal && (
        <AddNewLinkModal
          isOpen={showLinkModal}
          onClose={() => {setShowLinkModal(false); fetchLinks();}}
          projectId={projectId}
          onSuccess={async () => {
            await fetchLinks();
            setError('Link added successfully!');
            setTimeout(() => setError(''), 3000);
          }}
        />
      )}
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
        projectName={projectData?.project_name}
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