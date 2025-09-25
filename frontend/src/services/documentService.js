// Document API Service
const API_BASE_URL = 'http://127.0.0.1:8000';

class DocumentService {
  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token'); // Fixed: using 'token' instead of 'access_token'
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
    const token = localStorage.getItem('token'); // Fixed: using 'token' instead of 'access_token'
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

  // Get all documents for the current user using the new upload endpoint
  async getDocuments() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/uploads/`, {
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

  // Upload a new document using the new dedicated upload endpoint
  async uploadDocument(file, projectId, title = '', description = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      const response = await fetch(`${API_BASE_URL}/api/upload/`, {
        method: 'POST',
        headers: this.getMultipartHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
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

  // Update a document's metadata in the file-based system
  async updateDocument(document, updates) {
    try {
      if (!document) {
        throw new Error('No document provided for update');
      }
      
      // In our file-based system, we'll update the metadata file
      const filePath = document.file_path || document.path || '';
      
      if (!filePath) {
        throw new Error('Document file path is missing');
      }
      
      // Create metadata path by replacing the file extension with _metadata.json
      // or appending _metadata.json if no extension is found
      let metadataPath;
      const lastDotIndex = filePath.lastIndexOf('.');
      if (lastDotIndex > 0) {
        metadataPath = filePath.substring(0, lastDotIndex) + '_metadata.json';
      } else {
        metadataPath = filePath + '_metadata.json';
      }
      
      console.log('Fetching metadata from:', metadataPath);
      
      // Get the current metadata
      const metadataResponse = await fetch(`${API_BASE_URL}/api/view/${encodeURIComponent(metadataPath)}/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!metadataResponse.ok) {
        const errorText = await metadataResponse.text();
        console.error('Failed to fetch metadata:', errorText);
        throw new Error(`Failed to fetch document metadata: ${metadataResponse.status} - ${errorText}`);
      }
      
      let metadata;
      try {
        metadata = await metadataResponse.json();
      } catch (e) {
        console.error('Failed to parse metadata JSON:', e);
        throw new Error('Invalid metadata format received from server');
      }
      
      // Update the metadata with the new values
      const updatedMetadata = {
        ...metadata,
        title: updates.title !== undefined ? updates.title : (metadata.title || document.title || document.name || ''),
        name: updates.name !== undefined ? updates.name : (metadata.name || document.name || document.title || ''),
        description: updates.description !== undefined ? updates.description : (metadata.description || document.description || ''),
        last_modified: new Date().toISOString(),
      };
      
      console.log('Updating metadata with:', updatedMetadata);
      
      // Save the updated metadata back to the file
      const updateResponse = await fetch(`${API_BASE_URL}/api/update-metadata/`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_path: metadataPath,
          metadata: updatedMetadata,
        }),
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}));
        console.error('Update metadata failed:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${updateResponse.status}`);
      }
      
      // Return the updated document with all the changes
      const result = {
        ...document,
        ...updates,
        file_path: filePath,
        last_modified: updatedMetadata.last_modified,
      };
      
      console.log('Update successful, returning:', result);
      return result;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Delete a document using file path
  async deleteDocument(document) {
    try {
      // Use the file_path from the document object instead of documentId
      const url = `${API_BASE_URL}/api/delete-document/`;
      const headers = this.getAuthHeaders();
      
      console.log('Delete request details:');
      console.log('URL:', url);
      console.log('Headers:', headers);
      console.log('Document:', document);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_path: document.file_path
        }),
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Delete response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      // Get the response data
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

  // View a document using the new file-based endpoint
  async viewDocument(doc) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Construct the view URL using the file_path from the document
      const filePath = encodeURIComponent(doc.file_path);
      const viewUrl = `${API_BASE_URL}/api/view/${filePath}/`;
      
      // Add token to URL as a query parameter
      const url = new URL(viewUrl);
      url.searchParams.append('token', token);
      
      // Open the URL in a new tab
      window.open(url.toString(), '_blank');
      
      return { success: true, message: 'Document opened for viewing' };
    } catch (error) {
      console.error('Error viewing document:', error);
      throw error;
    }
}

// Download a document using the new file-based endpoint
async downloadDocument(document) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const filePath = document.file_path || `${document.uploader}/${document.filename}`;
    const response = await fetch(`${API_BASE_URL}/api/view/${filePath}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
  }

  // Task-Based Document Management Methods

  // Get all tasks with documents and user permissions
  async getUserTasksWithDocuments() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/documents/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user tasks with documents:', error);
      throw error;
    }
  }

  // Upload document to a specific task
  async uploadTaskDocument(taskId, file, title, description) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('task_id', taskId);
      formData.append('title', title || file.name);
      formData.append('description', description || '');

      const response = await fetch(`${API_BASE_URL}/api/tasks/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading task document:', error);
      throw error;
    }
  }
}

const documentService = new DocumentService();
export default documentService;