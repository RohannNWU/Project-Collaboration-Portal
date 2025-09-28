import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const GroupLeaderDashboard = () => {
    const [activeTab, setActiveTab] = useState('project-description');
    const [projectData, setProjectData] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [documentsByTask, setDocumentsByTask] = useState({});
    const [expandedTasks, setExpandedTasks] = useState({});
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

    const handleAddNewTask = (projectId) => {
        navigate('/editproject', { state: { projectId: projectId, projectName: projectData.project_name } });
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
                <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
                        Project Details
                    </h2>
                    {error && (
                        <div
                            style={{
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                padding: '0.75rem',
                                borderRadius: '0.25rem',
                                marginBottom: '1rem',
                                border: '1px solid #f5c6cb',
                                textAlign: 'center',
                            }}
                        >
                            {error}
                        </div>
                    )}
                    {loadingProject ? (
                        <div style={{ textAlign: 'center', color: '#4b5563', padding: '1rem' }}>
                            Loading project details...
                        </div>
                    ) : !projectData ? (
                        <div style={{ textAlign: 'center', color: '#4b5563', padding: '1rem' }}>
                            No project details available.
                        </div>
                    ) : (
                        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #d1d5db', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>
                                    Project Name
                                </h3>
                                <p style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                                    {projectData.project_name || 'N/A'}
                                </p>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>
                                    Description
                                </h3>
                                <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    {projectData.project_description || 'No description provided.'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>
                                        Due Date
                                    </h3>
                                    <p style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                                        {projectData.due_date || 'No due date'}
                                    </p>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>
                                        Created On
                                    </h3>
                                    <p style={{ color: '#4b5563', fontSize: '0.95rem' }}>
                                        {projectData.created_on || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>
                                    Feedback
                                </h3>
                                <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                    {projectData.feedback || 'No feedback provided.'}
                                </p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>
                                    Grade
                                </h3>
                                <p style={{ color: '#4b5563', fontSize: '0.95rem' }}>
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
                <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
                        Project Tasks
                    </h2>
                    {error && (
                        <div
                            style={{
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                padding: '0.75rem',
                                borderRadius: '0.25rem',
                                marginBottom: '1rem',
                                border: '1px solid #f5c6cb',
                                textAlign: 'center',
                            }}
                        >
                            {error}
                        </div>
                    )}
                    {loadingTasks ? (
                        <div style={{ textAlign: 'center', color: '#4b5563', padding: '1rem' }}>
                            Loading tasks...
                        </div>
                    ) : tasks.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#4b5563', padding: '1rem' }}>
                            No tasks found for this project.
                        </div>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {tasks.map((task) => (
                                    <div
                                        key={task.task_id}
                                        style={{
                                            padding: '0.75rem',
                                            backgroundColor: 'white',
                                            borderRadius: '0.25rem',
                                            border: '1px solid #d1d5db',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateX(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}

                                        >
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.95rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>
                                                    {task.task_name}
                                                </p>
                                                <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                                                    {task.task_description}
                                                </p>
                                                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                    Due: {task.task_due_date} | Status: {task.task_status} | Priority: {task.task_priority}
                                                </p>
                                                <button style={{ width: '150px' }} onClick={() => handleDelete(task.task_id)}>Delete Task</button>
                                            </div>
                                            <div
                                                style={{
                                                    transform: expandedTasks[task.task_id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.2s ease',
                                                    color: '#6b7280',
                                                }}
                                                onClick={() => toggleTaskDropdown(task.task_id)}
                                            >
                                                ▼
                                            </div>
                                        </div>
                                        {expandedTasks[task.task_id] && (
                                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                                                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#1f2937' }}>
                                                    Documents
                                                </h4>
                                                {loadingDocuments[task.task_id] ? (
                                                    <p style={{ fontSize: '0.85rem', color: '#4b5563', textAlign: 'center' }}>Loading documents...</p>
                                                ) : documentsByTask[task.task_id]?.length > 0 ? (
                                                    <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {documentsByTask[task.task_id].map((doc) => (
                                                            <li
                                                                key={doc.document_id}
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    padding: '0.5rem',
                                                                    backgroundColor: '#f9fafb',
                                                                    borderRadius: '0.25rem',
                                                                    border: '1px solid #e5e7eb',
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                                                }}
                                                            >
                                                                <span style={{ fontSize: '0.85rem', color: '#1f2937' }}>
                                                                    {doc.document_title} ({doc.doc_type})
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDownload(doc.document_id, doc.document_title)}
                                                                    style={{
                                                                        padding: '0.25rem 0.75rem',
                                                                        backgroundColor: '#3b82f6',
                                                                        color: 'white',
                                                                        borderRadius: '0.25rem',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.75rem',
                                                                        transition: 'background-color 0.2s',
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.backgroundColor = '#2563eb';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.backgroundColor = '#3b82f6';
                                                                    }}
                                                                >
                                                                    Download
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p style={{ fontSize: '0.85rem', color: '#4b5563', textAlign: 'center' }}>No documents available.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button style={{ width: '200px' }} onClick={() => handleAddNewTask(projectId)}>Add New Task</button>
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: 'review_tasks',
            label: 'Review Tasks',
            content: (
                <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
                        Review Submitted Tasks
                    </h2>
                    {loadingTasks ? (
                        <div style={{ textAlign: 'center', color: '#4b5563', padding: '1rem' }}>
                            Loading tasks...
                        </div>
                    ) : tasks.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#4b5563', padding: '1rem' }}>
                            No tasks found for this project.
                        </div>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {tasks.map((task) => (
                                    <div
                                        key={task.task_id}
                                        style={{
                                            padding: '0.75rem',
                                            backgroundColor: 'white',
                                            borderRadius: '0.25rem',
                                            border: '1px solid #d1d5db',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateX(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }}

                                        >
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.95rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>
                                                    {task.task_name}
                                                </p>
                                                <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                                                    {task.task_description}
                                                </p>
                                                <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                    Due: {task.task_due_date} | Status: {task.task_status} | Priority: {task.task_priority}
                                                </p>
                                                <p>
                                                    <p>
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
                                                </p>
                                            </div>
                                            <div
                                                style={{
                                                    transform: expandedTasks[task.task_id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.2s ease',
                                                    color: '#6b7280',
                                                }}
                                                onClick={() => toggleTaskDropdown(task.task_id)}
                                            >
                                                ▼
                                            </div>
                                        </div>
                                        {expandedTasks[task.task_id] && (
                                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                                                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: '#1f2937' }}>
                                                    Documents
                                                </h4>
                                                {loadingDocuments[task.task_id] ? (
                                                    <p style={{ fontSize: '0.85rem', color: '#4b5563', textAlign: 'center' }}>Loading documents...</p>
                                                ) : documentsByTask[task.task_id]?.length > 0 ? (
                                                    <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {documentsByTask[task.task_id].map((doc) => (
                                                            <li
                                                                key={doc.document_id}
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    padding: '0.5rem',
                                                                    backgroundColor: '#f9fafb',
                                                                    borderRadius: '0.25rem',
                                                                    border: '1px solid #e5e7eb',
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                                                }}
                                                            >
                                                                <span style={{ fontSize: '0.85rem', color: '#1f2937' }}>
                                                                    {doc.document_title} ({doc.doc_type})
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDownload(doc.document_id, doc.document_title)}
                                                                    style={{
                                                                        padding: '0.25rem 0.75rem',
                                                                        backgroundColor: '#3b82f6',
                                                                        color: 'white',
                                                                        borderRadius: '0.25rem',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.75rem',
                                                                        transition: 'background-color 0.2s',
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.backgroundColor = '#2563eb';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.backgroundColor = '#3b82f6';
                                                                    }}
                                                                >
                                                                    Download
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p style={{ fontSize: '0.85rem', color: '#4b5563', textAlign: 'center' }}>No documents available.</p>
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
                <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                        Team Chat
                    </h2>
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '0.25rem',
                            border: '1px solid #d1d5db',
                            height: '16rem',
                            padding: '1rem',
                            overflowY: 'auto',
                            marginBottom: '1rem',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <div
                                    style={{
                                        width: '2rem',
                                        height: '2rem',
                                        backgroundColor: '#3b82f6',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        flexShrink: 0,
                                    }}
                                >
                                    A
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>
                                        Alice
                                    </p>
                                    <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                                        Hey team, how's the project coming along?
                                    </p>
                                </div>
                            </div>
                            {/* Other chat messages */}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.25rem',
                                outline: 'none',
                                fontSize: '0.875rem',
                            }}
                        />
                        <button
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                borderRadius: '0.25rem',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
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
                <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
                        Team Members
                    </h2>
                    {error && (
                        <div
                            style={{
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                padding: '0.75rem',
                                borderRadius: '0.25rem',
                                marginBottom: '1rem',
                                border: '1px solid #f5c6cb',
                                textAlign: 'center',
                            }}
                        >
                            {error}
                        </div>
                    )}
                    {loadingMembers ? (
                        <div style={{ textAlign: 'center', color: '#4b5563', padding: '1rem' }}>
                            Loading members...
                        </div>
                    ) : members.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#4b5563', padding: '1rem' }}>
                            No members found for this project.
                        </div>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {members.map((member, index) => (
                                    <div
                                        key={member.email}
                                        style={{
                                            padding: '0.75rem',
                                            backgroundColor: 'white',
                                            borderRadius: '0.25rem',
                                            border: '1px solid #d1d5db',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateX(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '2.5rem',
                                                height: '2.5rem',
                                                backgroundColor: '#3b82f6',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1rem',
                                                fontWeight: '500',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {member.first_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.95rem', fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>
                                                {member.first_name} {member.last_name}
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                                                {member.email}
                                            </p>
                                            <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                Role: {member.role}
                                            </p>
                                        </div>
                                        <button style={{ width: '150px' }} onClick={() => handleMemberDelete(member.email)}>Delete Member</button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => navigate('/addprojectmembers', { state: { projectId: projectId } })}>Add Members</button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem' }}>
            <div style={{ width: '80%', margin: '0 auto' }}>
                <div
                    style={{
                        backgroundColor: '#1f2937',
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                        border: '2px solid #374151',
                    }}
                >
                    <div style={{ display: 'flex' }}>
                        {tabs.map((tab, index) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flex: 1,
                                    padding: '1rem 1.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    borderRight: index < tabs.length - 1 ? '1px solid #4b5563' : 'none',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    backgroundColor: activeTab === tab.id ? '#374151' : '#1f2937',
                                    color: activeTab === tab.id ? 'white' : '#d1d5db',
                                    cursor: 'pointer',
                                    border: 'none',
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== tab.id) {
                                        e.target.style.backgroundColor = '#374151';
                                        e.target.style.color = 'white';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== tab.id) {
                                        e.target.style.backgroundColor = '#1f2937';
                                        e.target.style.color = '#d1d5db';
                                    }
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ backgroundColor: '#9ca3af', minHeight: '600px', color: '#1f2937' }}>
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
                style={{
                    position: 'fixed',
                    bottom: '1rem',
                    left: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#3b82f6';
                }}
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default GroupLeaderDashboard;