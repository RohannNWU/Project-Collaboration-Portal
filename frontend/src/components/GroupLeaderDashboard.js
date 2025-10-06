import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TaskUpdateModel from './TaskUpdateModel';
import AddTaskModal from './AddTaskModal';
import AddNewLinkModal from './AddNewLinkModal';
import styles from './RoleDashboards.module.css';

const GroupLeaderDashboard = () => {
    const [activeTab, setActiveTab] = useState('project-description');
    const [projectData, setProjectData] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [documentsByTask, setDocumentsByTask] = useState({});
    const [links, setLinks] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [expandedTasks, setExpandedTasks] = useState({});
    const [expandedSections, setExpandedSections] = useState({ myTasks: false, projectTasks: false, links: false });
    const [userTaskAssignments, setUserTaskAssignments] = useState({});
    const [loadingProject, setLoadingProject] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [loadingDocuments, setLoadingDocuments] = useState({});
    const [loadingChat, setLoadingChat] = useState(false);
    const [loadingLinks, setLoadingLinks] = useState(false);
    const [error, setError] = useState('');
    const [myTasks, setMyTasks] = useState([]);
    const [projectTasks, setProjectTasks] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { projectId } = location.state || {};
    const chatContainerRef = useRef(null);
    const [showTaskUpdateModel, setShowTaskUpdateModel] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [finalTask, setFinalTask] = useState(null);
    const [finalDocuments, setFinalDocuments] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const isTempId = (id) => typeof id === 'string' && id.startsWith('temp-');


    if (projectId);
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

    const getApiConfig = (token) => {
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';

        return {
            baseURL: API_BASE_URL,
            headers: { Authorization: `Bearer ${token}` },
        };
    };

    // Refined fetchDocuments (no getApiConfig in deps needed now)
    const fetchDocuments = useCallback(async (taskId) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return [];  // Early return empty
        }

        setLoadingDocuments((prev) => ({ ...prev, [taskId]: true }));
        try {
            const config = getApiConfig(token);  // Plain function call
            const response = await axios.get(`${config.baseURL}/api/gettaskdocuments/?task_id=${taskId}`, {
                ...config,  // Spread headers
            });

            const docs = response.data.documents || [];
            setDocumentsByTask((prev) => ({
                ...prev,
                [taskId]: docs,
            }));

            return docs;  // Return for direct use
        } catch (err) {
            console.error(`Error fetching documents for task ${taskId}:`, err);
            setError('Failed to fetch documents');
            setTimeout(() => setError(''), 3000);
            return [];  // Return empty on error
        } finally {
            setLoadingDocuments((prev) => ({ ...prev, [taskId]: false }));
        }
    }, [navigate]);  // Unchanged—no getApiConfig dep

    // Fetch links
    const fetchLinks = useCallback(async () => {
        setLoadingLinks(true);
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

            const response = await axios.post(`${API_BASE_URL}/api/getprojectlinks/`, { projectId }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setLinks(Array.isArray(response.data.links) ? response.data.links : []);
        } catch (err) {
            console.error('Error fetching links:', err);
            setLinks([]);
            setError('Failed to fetch links');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoadingLinks(false);
        }
    }, [projectId, navigate]);

    // Refined fetchFinalSubmission (no getApiConfig in deps needed)
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
            const config = getApiConfig(token);  // Plain function call
            const response = await axios.get(`${config.baseURL}/api/getprojecttasks/?project_id=${projectId}`, {
                ...config,
            });

            const allTasks = response.data.tasks || [];
            const finalTaskData = allTasks.find(task => task.task_name === 'Final Submission');
            setFinalTask(finalTaskData || null);
            setTasks(allTasks);

            if (finalTaskData) {
                const docs = await fetchDocuments(finalTaskData.task_id);
                setFinalDocuments(docs);
            } else {
                setFinalDocuments([]);
            }
        } catch (err) {
            console.error('Error fetching final submission:', err);
            setError('Failed to fetch final submission');
            setTimeout(() => setError(''), 3000);
            setFinalDocuments([]);
        } finally {
            setLoadingTasks(false);
        }
    }, [projectId, navigate, fetchDocuments]);

    const handleUploadDocument = async (taskId) => {
        if (!uploadFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('task_id', taskId);
        formData.append('title', uploadFile.name);
        formData.append('file', uploadFile);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/');
                return;
            }

            const API_BASE_URL = window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

            await axios.post(`${API_BASE_URL}/api/uploaddocument/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });

            setUploadFile(null);
            const updatedDocs = await fetchDocuments(taskId); // Refresh documents
            setFinalDocuments(updatedDocs);
            setError('Document uploaded successfully!');
            setTimeout(() => setError(''), 3000);
            fetchFinalSubmission();
        } catch (err) {
            console.error('Error uploading document:', err);
            setError('Failed to upload document');
            setTimeout(() => setError(''), 3000);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'final-submission' && projectId) {  // Or 'review_project' if that's the tab
            fetchFinalSubmission();
        }
    }, [activeTab, projectId, fetchFinalSubmission]);

    // Fetch chat messages function
    const fetchChat = useCallback(async () => {
        setError('');
        setLoadingChat(true);
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
        } finally {
            setLoadingChat(false);
        }
    }, [projectId, navigate]);


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
        const tempMessage = {
            id: tempId,
            content: messageContent,
            sender_name: 'You',
            role: userRole || 'Group Leader',
            sent_at: new Date().toLocaleString('en-GB', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/, '$3-$2-$1 $4'),
        };

        // show temp message immediately
        setChatMessages(prev => [...prev, tempMessage]);
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

    useEffect(() => {
        if (activeTab === 'chat' && projectId) {
            fetchChat();
        }
    }, [activeTab, projectId, navigate, fetchChat]);

    // Redirect if no projectId
    useEffect(() => {
        if (!projectId) {
            navigate('/dashboard');
        }
    }, [projectId, navigate]);

    const handleAddNewTask = (id) => {
        setShowModal(true);
    };

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
    useEffect(() => {
        if (activeTab === 'project-description' && projectId) {
            fetchProjectData();
        }
    }, [activeTab, projectId, navigate, fetchProjectData]);

    const handleTaskUpdate = async ({ taskId, taskName, taskDescription, dueDate }) => {
        try {
            setError('Task updated successfully!');
            setTimeout(() => setError(''), 3000);
            await fetchTasks(); // Refresh tasks list
            setActiveTab('tasks'); // Stay on tasks tab
        } catch (err) {
            console.error('Error handling task update:', err);
            setError('Failed to refresh tasks after update');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Fetch tasks when Tasks tab is clicked


    useEffect(() => {
        if (activeTab === 'review_tasks' && projectId) {
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

                    const response = await axios.get(`${API_BASE_URL}/api/getcompletedtasks/?project_id=${projectId}`, {
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

    // Fetch documents for a specific task


    const handleCompleteTask = async (taskId, statusOfTask) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/');
                return;
            }

            const API_BASE_URL = window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

            await axios.post(`${API_BASE_URL}/api/completetask/`, { task_id: taskId, task_status: statusOfTask }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchTasks();
            fetchFinalSubmission();
            await fetchUserTaskAssignments();
            setTimeout(() => setError(''), 3000);
        } catch (err) {
            console.error(`Error marking task ${taskId} as complete:`, err);
            if (err.response?.status === 401) {
                localStorage.removeItem('access_token');
                navigate('/');
            } else if (err.response?.status === 404) {
                setError('Task not found');
                setTimeout(() => setError(''), 3000);
            } else if (err.response?.status === 403) {
                setError('Access denied to this task');
                setTimeout(() => setError(''), 3000);
            } else {
                setError('Failed to mark task as complete');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleFileSelect = (taskId, event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(taskId, file);
        }
    };

    const handleFileSelectFinal = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadFile(file);
        }
    };

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

            const updatedDocs = await fetchDocuments(taskId);
            if (taskId === finalTask?.task_id) {
                setFinalDocuments(updatedDocs);
            }
            setError('Document deleted successfully.');
            setTimeout(() => setError(''), 3000);
        } catch (err) {
            console.error(`Error deleting document ${documentId}:`, err);
            if (err.response?.status === 401) {
                localStorage.removeItem('access_token');
                navigate('/');
            } else if (err.response?.status === 404) {
                setError('Document not found');
                setTimeout(() => setError(''), 3000);
            } else if (err.response?.status === 403) {
                setError('Access denied to this document');
                setTimeout(() => setError(''), 3000);
            } else {
                setError('Failed to delete document');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

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
                setTimeout(() => setError(''), 3000);
            }
        }
    };

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
                headers: { Authorization: `Bearer ${token}` }
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
    }, [projectId, navigate, fetchUserTaskAssignments]);

    useEffect(() => {
        if (activeTab === 'tasks' && projectId) {
            fetchTasks();
            fetchLinks();
        }
    }, [activeTab, projectId, navigate, fetchTasks, fetchLinks]);

    useEffect(() => {
        const myTasksList = tasks.filter(task => userTaskAssignments[task.task_id] && task.task_name !== "Final Submission");
        const projectTasksList = tasks.filter(task => !userTaskAssignments[task.task_id] && task.task_name !== "Final Submission");
        setMyTasks(myTasksList);
        setProjectTasks(projectTasksList);
    }, [tasks, userTaskAssignments]);

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

    const handleReject = async (taskId) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/');
                return;
            }

            const API_BASE_URL = window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

            await axios.post(`${API_BASE_URL}/api/updatetask/${taskId}/`, {
                status: 'In Progress' // Payload directly
            }, {
                headers: { Authorization: `Bearer ${token}` } // Headers as a separate object
            });

            setTasks((prev) => prev.filter((task) => task.task_id !== taskId));
            setError('Task Rejected');
            setTimeout(() => setError(''), 3000);
        } catch (err) {
            console.error(`Error rejecting task ${taskId}:`, err);
            setError('Failed to reject task');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleApprove = async (taskId) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/');
                return;
            }

            const API_BASE_URL = window.location.hostname === 'localhost'
                ? 'http://127.0.0.1:8000'
                : 'https://pcp-backend-f4a2.onrender.com';

            await axios.post(`${API_BASE_URL}/api/updatetask/${taskId}/`, {
                status: 'Finalized' // Payload directly
            }, {
                headers: { Authorization: `Bearer ${token}` } // Headers as a separate object
            });

            setTasks((prev) => prev.filter((task) => task.task_id !== taskId));
            setError('Task approved.');
            setTimeout(() => setError(''), 3000);
        } catch (err) {
            console.error(`Error deleting task ${taskId}:`, err);
            setError('Failed to delete task');
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

            fetchMembers();
        }
    }, [activeTab, projectId, navigate]);

    const toggleTaskExpansion = (taskId) => {
        setExpandedTasks((prev) => {
            const isExpanded = prev[taskId];
            if (!isExpanded && !documentsByTask[taskId]) {
                fetchDocuments(taskId);
            }
            return { ...prev, [taskId]: !isExpanded };
        });
    };

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


    // Ensure the user is a Student before executing handler.
    const ensureGroupLeader = useCallback(
        async (handler) => {
            if (typeof handler !== 'function') {
                console.warn('ensureGroupLeader expects a function as the handler');
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

            // Normalize capitalization
            const normalizedRole = roleToCheck.trim().toLowerCase();

            if (normalizedRole === 'groupleader' || normalizedRole === 'group leader') {
                try {
                    return await handler();
                } catch (err) {
                    console.error('Error running protected handler:', err);
                }
            } else if (normalizedRole === 'supervisor') {
                navigate('/supervisordashboard', { state: { projectId } });
            } else if (normalizedRole === 'student') {
                navigate('/studentdashboard', { state: { projectId } });
            } else {
                setError('Failed to verify user role');
            }
        },
        [userRole, roleLoading, fetchUserRole, navigate, projectId]
    );

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
                            onClick={() => ensureGroupLeader(() => toggleSectionExpansion('myTasks'))}
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
                                                    onClick={() => ensureGroupLeader(() => toggleTaskExpansion(task.task_id))}
                                                >
                                                    <div className={styles.taskInfo}>
                                                        <h4 className={styles.taskName}>{task.task_name}</h4>
                                                        <p className={styles.taskMeta}>
                                                            Due: {task.task_due_date} | Status: {task.task_status} | Priority: {task.task_priority}
                                                        </p>
                                                        {
                                                            task.task_status === 'In Progress' && (
                                                                <button className={styles.deleteButton} onClick={() => ensureGroupLeader(() => handleDelete(task.task_id))}>Delete Task</button>
                                                            )
                                                        }
                                                        {
                                                            task.task_status === 'In Progress' && (
                                                                <button
                                                                    className={styles.addTaskButton}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // Still prevent propagation
                                                                        ensureGroupLeader(() => {
                                                                            setSelectedTaskId(task.task_id);
                                                                            setShowTaskUpdateModel(true);
                                                                        });
                                                                    }}
                                                                >
                                                                    Update Task Details
                                                                </button>
                                                            )
                                                        }
                                                    </div>
                                                    <div className={styles.taskActions}>
                                                        {userTaskAssignments[task.task_id] && task.task_status !== 'Completed' && task.task_status !== 'Finalized' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    ensureGroupLeader(() => {
                                                                        handleCompleteTask(task.task_id, 'Completed')
                                                                    });
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
                                                        <p className={styles.taskDescription}>{task.task_description || 'No description available.'}</p>
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
                                                                            {userTaskAssignments[task.task_id] && (
                                                                                <span
                                                                                    onClick={() => ensureGroupLeader(() => handleDeleteDocument(doc.document_id, task.task_id))}
                                                                                    className={styles.removeDocument}
                                                                                >
                                                                                    (remove)
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => ensureGroupLeader(() => handleDownload(doc.document_id, doc.document_title))}
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
                            onClick={() => ensureGroupLeader(() => toggleSectionExpansion('projectTasks'))}
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
                                                    onClick={() => ensureGroupLeader(() => toggleTaskExpansion(task.task_id))}
                                                >
                                                    <div className={styles.taskInfo}>
                                                        <h4 className={styles.taskName}>{task.task_name}</h4>
                                                        <p className={styles.taskMeta}>
                                                            Due: {task.task_due_date} | Status: {task.task_status} | Priority: {task.task_priority}
                                                        </p>
                                                        {
                                                            task.task_status === 'In Progress' && (
                                                                <button className={styles.deleteButton} onClick={() => ensureGroupLeader(() => handleDelete(task.task_id))}>Delete Task</button>
                                                            )
                                                        }
                                                        {
                                                            task.task_status === 'In Progress' && (
                                                                <button
                                                                    className={styles.addTaskButton}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // Prevent triggering toggleTaskExpansion
                                                                        ensureGroupLeader(() => {
                                                                            setSelectedTaskId(task.task_id); // Set the task ID
                                                                            setShowTaskUpdateModel(true)
                                                                        }); // Open the model
                                                                    }}
                                                                >
                                                                    Update Task Details
                                                                </button>
                                                            )
                                                        }
                                                    </div>
                                                    <div className={styles.taskActions}>
                                                        {userTaskAssignments[task.task_id] && task.task_status !== 'Completed' && task.task_status !== 'Finalized' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    ensureGroupLeader(() => {
                                                                        handleCompleteTask(task.task_id, 'Completed')
                                                                    });
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
                                                        <p className={styles.taskDescription}>{task.task_description || 'No description available.'}</p>
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
                                                                            {userTaskAssignments[task.task_id] && (
                                                                                <span
                                                                                    onClick={() => ensureGroupLeader(() => handleDeleteDocument(doc.document_id, task.task_id))}
                                                                                    className={styles.removeDocument}
                                                                                >
                                                                                    (remove)
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            onClick={() => ensureGroupLeader(() => handleDownload(doc.document_id, doc.document_title))}
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

                    {/* Important Links Section */}
                    <div className={styles.section}>
                        <div
                            className={`${styles.sectionHeader} ${expandedSections.links ? styles.sectionHeaderExpanded : ''}`}
                            onClick={() => ensureGroupLeader(() => toggleSectionExpansion('links'))}
                        >
                            <h2 className={styles.sectionHeading}>Important Links for the Project</h2>
                            <span className={`${styles.dropdownToggle} ${expandedSections.links ? styles.dropdownToggleActive : ''}`}>
                                ▼
                            </span>
                        </div>
                        {expandedSections.links && (
                            <div className={styles.sectionContent}>
                                {loadingLinks ? (
                                    <div className={styles.loadingMessage}>Loading links...</div>
                                ) : !links || links.length === 0 ? (
                                    <div className={styles.noDataMessage}>No links available.</div>
                                ) : (
                                    <ul className={styles.linksList}>
                                        {links.map((link) => (
                                            <li key={link.link_id} className={styles.linkItem}>
                                                <a href={link.link_url} target="_blank" rel="noopener noreferrer">{link.link_name || link.link_url}</a>
                                                <span
                                                    onClick={() => ensureGroupLeader(() => handleDeleteLink(link.link_id, link.project_id))}
                                                    className={styles.removeDocument}
                                                >
                                                    (remove)
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <button
                                    className={styles.addTaskButton}
                                    onClick={() => ensureGroupLeader(() => setShowLinkModal(true))}
                                >
                                    Add Link
                                </button>
                            </div>
                        )}
                        <button
                            className={styles.addTaskButton}
                            onClick={() => ensureGroupLeader(() => handleAddNewTask())}
                        >Add New Task</button>
                    </div>
                    {showLinkModal && (
                        <AddNewLinkModal
                            isOpen={showLinkModal}
                            onClose={() => setShowLinkModal(false)}
                            projectId={projectId}
                            onSuccess={async () => {
                                await fetchLinks();
                                setError('Link added successfully!');
                                setTimeout(() => setError(''), 3000);
                            }}
                        />
                    )}
                    {showModal && (
                        <AddTaskModal
                            isOpen={showModal}
                            onClose={() => setShowModal(false)}
                            projectId={projectId}
                            onSuccess={async () => {
                                await fetchTasks();
                                setError('Task added successfully!');
                                setTimeout(() => setError(''), 3000);
                            }}
                        />
                    )}
                </div>
            ),
        },
        {
            id: 'review_tasks',
            label: 'Review Tasks',
            content: (
                <div className={styles.tabContent}>
                    <h2 className={styles.tabHeading}>Review Submitted Tasks</h2>
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
                                                <button className={styles.rejectButton} onClick={() => ensureGroupLeader(() => handleReject(task.task_id))}>Reject and Send back</button>
                                                <button className={styles.approveButton} onClick={() => ensureGroupLeader(() => handleApprove(task.task_id))}>Approve and Finalize</button>
                                            </div>
                                            <div
                                                className={`${styles.dropdownToggle} ${expandedTasks[task.task_id] ? styles.dropdownToggleActive : ''}`}
                                                onClick={() => ensureGroupLeader(() => toggleTaskDropdown(task.task_id))}
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
                                                                    onClick={() => ensureGroupLeader(() => handleDownload(doc.document_id, doc.document_title))}
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
                    <div className={styles.chatInputContainer}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className={styles.chatInput}
                        />
                        <button
                            onClick={() => ensureGroupLeader(handleSendMessage)}
                            disabled={!messageInput.trim()}
                            className={`${styles.sendButton} ${!messageInput.trim() ? styles.sendButtonDisabled : ''}`}
                        >
                            Send
                        </button>
                    </div>
                </div>
            ),
        },
        {
            id: 'final-submission',
            label: 'Final Submission',
            content: (
                <div className={styles.tabContent}>
                    <h2 className={styles.tabHeading}>Final Submission</h2>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {loadingTasks ? (
                        <div className={styles.loadingMessage}>Loading final submission...</div>
                    ) : !finalTask ? (
                        <div className={styles.noDataMessage}>No Final Submission task found. Contact supervisor.</div>
                    ) : (
                        (() => {
                            const otherTasks = tasks.filter(task => task.task_id !== finalTask.task_id);
                            const allOtherTasksFinalized = otherTasks.length > 0 ? otherTasks.every(task => task.task_status === 'Finalized') : true;
                            return (
                                <div>
                                    <div className={styles.taskInfo}>
                                        <h3>{finalTask.task_name}</h3>
                                        <p><strong>Description:</strong> {finalTask.task_description}</p>
                                        <p><strong>Due Date:</strong> {finalTask.task_due_date}</p>
                                        <p><strong>Status:</strong> {finalTask.task_status}</p>
                                    </div>
                                    {/* Upload Form - Consistent with Tasks */}
                                    <div className={styles.uploadSection}>
                                        <h4>Upload Documents</h4>
                                        <div className={styles.formGroup}>
                                            <div className={styles.uploadContainer}>
                                                <label
                                                    htmlFor="file-upload-final"
                                                    className={`${styles.uploadButton} ${finalTask.task_status === 'Finalized' ? styles.disabled : ''}`}
                                                >
                                                    Upload Document
                                                </label>
                                                <input
                                                    id="file-upload-final"
                                                    type="file"
                                                    className={styles.fileInput}
                                                    onChange={handleFileSelectFinal}
                                                    disabled={uploading || finalTask.task_status === 'Finalized'}
                                                />
                                            </div>
                                            <button
                                                onClick={() => ensureGroupLeader(() => handleUploadDocument(finalTask.task_id))}
                                                disabled={!uploadFile || uploading || finalTask.task_status === 'Finalized'}
                                                className={styles.uploadButton}
                                            >
                                                {uploading ? 'Uploading...' : 'Upload'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Uploaded Documents Section */}
                                    <div className={styles.uploadedSection}>
                                        <h4>Uploaded Project Documents</h4>
                                        {finalDocuments.length > 0 ? (
                                            <ul className={styles.documentList}>
                                                {finalDocuments.map((doc, index) => (
                                                    <li key={doc.document_id || index} className={styles.documentItem}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.classList.add(styles.documentItemHover);
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.classList.remove(styles.documentItemHover);
                                                        }}
                                                    >
                                                        <div className={styles.documentInfo}>
                                                            <span>{doc.document_title || `Document ${index + 1}`}</span>
                                                            {finalTask.task_status !== 'Finalized' && (
                                                                <span
                                                                    onClick={() => ensureGroupLeader(() => handleDeleteDocument(doc.document_id, finalTask.task_id))}
                                                                    className={styles.removeDocument}
                                                                >
                                                                    (remove)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => ensureGroupLeader(() => handleDownload(doc.document_id, doc.document_title))}
                                                            className={styles.downloadButton}
                                                        >
                                                            Download
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className={styles.noDataMessage}>No documents uploaded yet.</p>
                                        )}
                                    </div>

                                    {finalTask.task_status === 'In Progress' && (
                                        <button
                                            className={styles.uploadButton}
                                            onClick={() => ensureGroupLeader(() => handleCompleteTask(finalTask.task_id, 'Finalized'))}
                                            disabled={!allOtherTasksFinalized || finalDocuments.length === 0}
                                        >
                                            Submit Project
                                        </button>
                                    )}
                                    {finalTask.task_status === 'Finalized' && (
                                        <p className={styles.successMessage}>Project submitted! Awaiting supervisor review.</p>
                                    )}
                                </div>
                            );
                        })()
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
                                onClick={() => ensureGroupLeader(() => setActiveTab(tab.id))}
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
            <TaskUpdateModel
                isOpen={showTaskUpdateModel}
                onClose={() => {
                    setShowTaskUpdateModel(false);
                    setSelectedTaskId(null); // Reset task ID when closing
                }}
                projectId={projectId}
                taskId={selectedTaskId}
                onUpdate={handleTaskUpdate}
                initialName={tasks.find(task => task.task_id === selectedTaskId)?.task_name || ''}
                initialDescription={tasks.find(task => task.task_id === selectedTaskId)?.task_description || ''}
                initialDueDate={tasks.find(task => task.task_id === selectedTaskId)?.task_due_date || ''}
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

export default GroupLeaderDashboard;