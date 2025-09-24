// Document API Service
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://127.0.0.1:8000'
  : 'https://pcp-backend-f4a2.onrender.com';

class DocumentService {
  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    console.log('Auth token from localStorage:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      console.error('No authentication token found in localStorage');
      throw new Error('Authentication required. Please log in again.');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get multipart headers for file uploads
  getMultipartHeaders() {
    const token = localStorage.getItem('access_token');
    console.log('Auth token for multipart:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      console.error('No authentication token found in localStorage');
      throw new Error('Authentication required. Please log in again.');
    }
    
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



  // Get all documents for a project
  async getProjectDocuments(projectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/?project_id=${projectId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('Error fetching project documents:', error);
      throw error;
    }
  }

  // Get all documents for the current user
  async getDocuments() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/documents/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.documents || data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  // Upload a new document
  async uploadDocument(file, projectId, title = '', description = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch(`${API_BASE_URL}/api/documents/`, {
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

        response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/`, {
          method: 'PUT',
          headers: this.getMultipartHeaders(),
          body: formData,
        });
      } else {
        // If only updating metadata, use JSON
        response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/`, {
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
      const url = `${API_BASE_URL}/api/documents/${documentId}/`;
      const headers = this.getAuthHeaders();
      
      console.log('Delete request details:');
      console.log('URL:', url);
      console.log('Headers:', headers);
      console.log('Document ID:', documentId);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers,
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Delete response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Try to parse JSON response, but handle cases where response might be empty
      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : { message: 'Document deleted successfully' };
      } catch (parseError) {
        console.log('Response parsing failed, assuming success');
        data = { message: 'Document deleted successfully' };
      }
      
      console.log('Delete response data:', data);
      return data;
    } catch (error) {
      console.error('Error deleting document:', error);
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
      }
      
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

export default DocumentService;