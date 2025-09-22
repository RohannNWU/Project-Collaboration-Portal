// Document API Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class DocumentService {
  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get multipart headers for file uploads
  getMultipartHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Get user email from localStorage
  getUserEmail() {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser).email : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
      return null;
    }
  }

  // Upload a new document
  async uploadDocument(file, projectId, description = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('description', description);
    if (projectId) {
      formData.append('task_id', projectId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/`, {
        method: 'POST',
        headers: this.getMultipartHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Get all documents for a project
  async getProjectDocuments(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/project/${projectId}/documents/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  // Upload a new document
  async uploadDocument(file, projectId, description = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      formData.append('description', description);

      const response = await fetch(`${API_BASE_URL}/api/documents/upload/`, {
        method: 'POST',
        headers: this.getMultipartHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Get a specific document
  async getDocument(documentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  // Update a document
  async updateDocument(documentId, updates, newFile = null) {
    try {
      let response;
      
      if (newFile) {
        // If updating with a new file, use FormData
        const formData = new FormData();
        formData.append('name', updates.name || '');
        formData.append('description', updates.description || '');
        formData.append('file', newFile);

        response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/edit/`, {
          method: 'PUT',
          headers: this.getMultipartHeaders(),
          body: formData,
        });
      } else {
        // If only updating metadata, use JSON
        response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/edit/`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(updates),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete a document
  async deleteDocument(documentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Download a document (placeholder - would need file serving endpoint)
  async downloadDocument(documentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/download/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Return blob for download
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }
}

export default new DocumentService();
