import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : 'https://pcp-backend-f4a2.onrender.com';

const documentService = {
  uploadDocument: async (file, projectId, title, description, taskId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    if (taskId) {
      formData.append('task_id', taskId);
    }
    // Project ID can be added if needed in the future
    // if (projectId) formData.append('project_id', projectId);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/document-upload/`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default documentService;