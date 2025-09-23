import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Layout from './layout/Layout';
import Loading from './common/Loading';
import documentService from '../services/documentService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile, faTrash, faEdit, faEye, faDownload, faSearch,
  faFilter, faSort, faFileAlt, faFilePdf, faFileWord,
  faFileExcel, faFilePowerpoint, faFileImage, faFileVideo,
  faFileAudio, faFileArchive, faFileCode, faPlus, faSave,
  faTimes, faCalendarAlt, faUser, faWeight
} from '@fortawesome/free-solid-svg-icons';
import styles from './Dashboard.module.css';

const DocumentManager = () => {
  const appContext = useApp();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('upload_date');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Load documents from backend on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDocuments = await documentService.getDocuments();
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setError('Failed to load documents. Please try again.');
      // Fallback to local state if API fails
      setDocuments(appContext.documents || []);
    } finally {
      setLoading(false);
    }
  };

  // Get file type icon
  const getFileIcon = (fileType) => {
    if (!fileType) return faFile;
    
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return faFilePdf;
    if (type.includes('word') || type.includes('msword')) return faFileWord;
    if (type.includes('excel') || type.includes('spreadsheet')) return faFileExcel;
    if (type.includes('powerpoint') || type.includes('presentation')) return faFilePowerpoint;
    if (type.includes('image')) return faFileImage;
    if (type.includes('video')) return faFileVideo;
    if (type.includes('audio')) return faFileAudio;
    if (type.includes('zip') || type.includes('rar')) return faFileArchive;
    if (type.includes('javascript') || type.includes('python') || type.includes('code')) return faFileCode;
    return faFileAlt;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const docName = doc.name || doc.title || '';
      const docDescription = doc.description || '';
      const matchesSearch = docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           docDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      
      const fileType = doc.type || doc.file_type || '';
      switch (filterBy) {
        case 'pdf': return matchesSearch && fileType.toLowerCase().includes('pdf');
        case 'image': return matchesSearch && fileType.toLowerCase().includes('image');
        case 'document': return matchesSearch && (fileType.toLowerCase().includes('word') || fileType.toLowerCase().includes('text'));
        case 'spreadsheet': return matchesSearch && fileType.toLowerCase().includes('excel');
        default: return matchesSearch;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'size': return (b.size || b.file_size || 0) - (a.size || a.file_size || 0);
        case 'type': return (a.type || a.file_type || '').localeCompare(b.type || b.file_type || '');
        case 'upload_date':
        default:
          const dateA = new Date(a.uploadDate || a.upload_date);
          const dateB = new Date(b.uploadDate || b.upload_date);
          return dateB - dateA;
      }
    });

  // Handle document deletion
  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        console.log('Deleting document with ID:', documentId);
        setLoading(true);
        
        const response = await documentService.deleteDocument(documentId);
        console.log('Delete response:', response);
        
        // Remove document from local state
        const updatedDocuments = documents.filter(doc => doc.id !== documentId);
        setDocuments(updatedDocuments);
        setSelectedDocument(null);
        
        // Show success message
        alert('Document deleted successfully!');
        
        // Also try to add notification if available
        if (appContext.addNotification) {
          appContext.addNotification({
            type: 'success',
            message: 'Document deleted successfully'
          });
        }
      } catch (error) {
        console.error('Failed to delete document:', error);
        alert('Failed to delete document. Please try again.');
        
        if (appContext.addNotification) {
          appContext.addNotification({
            type: 'error',
            message: 'Failed to delete document. Please try again.'
          });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle document editing
  const handleEdit = (document) => {
    setSelectedDocument(document);
    setEditForm({
      name: document.name,
      description: document.description || ''
    });
    setIsEditing(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      alert('Document name is required');
      return;
    }

    try {
      console.log('Updating document:', selectedDocument.id, editForm);
      setLoading(true);
      
      const updatedDocument = await documentService.updateDocument(selectedDocument.id, {
        title: editForm.name,
        name: editForm.name,
        description: editForm.description
      });
      
      console.log('Update response:', updatedDocument);

      // Update document in local state
      setDocuments(documents.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, name: editForm.name, title: editForm.name, description: editForm.description }
          : doc
      ));

      alert('Document updated successfully!');
      
      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'success',
          message: 'Document updated successfully'
        });
      }

      setIsEditing(false);
      setSelectedDocument(null);
      setEditForm({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to update document:', error);
      alert('Failed to update document. Please try again.');
      
      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'error',
          message: 'Failed to update document. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedDocument(null);
    setEditForm({ name: '', description: '' });
  };

  // Handle document view/download
  const handleView = async (document) => {
    try {
      console.log('Downloading document:', document);
      setLoading(true);
      
      const blob = await documentService.downloadDocument(document.id);
      console.log('Download blob received:', blob);
      
      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name || document.title || `document_${document.id}`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Document downloaded successfully!');
      
      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'success',
          message: 'Document downloaded successfully'
        });
      }
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document. Please try again.');
      
      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'error',
          message: 'Failed to download document. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle document preview (for supported file types)
  const handlePreview = (document) => {
    // For now, show document details in a modal or alert
    const details = `
Document Details:
- Title: ${document.name || document.title}
- Description: ${document.description || 'No description'}
- Size: ${formatFileSize(document.size || document.file_size || 0)}
- Type: ${document.type || document.file_type || 'Unknown'}
- Uploaded: ${formatDate(document.uploadDate || document.upload_date)}
- Uploaded by: ${document.uploadedBy || document.uploaded_by || 'Unknown'}
    `;
    alert(details);
  };

  if (loading) {
    return (
      <Layout title="Document Manager" subtitle="Managing your uploaded documents">
        <Loading message="Loading your documents..." size="lg" />
      </Layout>
    );
  }

  return (
    <Layout 
      title="Document Manager" 
      subtitle="View, edit, and manage your uploaded documents"
    >
      <div className={styles.dashboardContainer}>
        {/* Document Statistics */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faFile} style={{ color: '#3498db' }} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{documents.length}</div>
              <div className={styles.statLabel}>Total Documents</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faWeight} style={{ color: '#e74c3c' }} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {formatFileSize(documents.reduce((total, doc) => total + (doc.size || doc.file_size || 0), 0))}
              </div>
              <div className={styles.statLabel}>Total Size</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#27ae60' }} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {documents.filter(doc => {
                  const uploadDate = new Date(doc.uploadDate || doc.upload_date);
                  const today = new Date();
                  const diffTime = Math.abs(today - uploadDate);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length}
              </div>
              <div className={styles.statLabel}>This Week</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FontAwesomeIcon icon={faFileAlt} style={{ color: '#f39c12' }} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {new Set(documents.map(doc => (doc.type || doc.file_type || '').split('/')[0])).size}
              </div>
              <div className={styles.statLabel}>File Types</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controlsPanel}>
          <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterControls}>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Files</option>
              <option value="pdf">PDF Files</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
              <option value="spreadsheet">Spreadsheets</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="upload_date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="type">Sort by Type</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className={styles.viewToggle}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
          </div>
        </div>

        {/* Documents Display */}
        {filteredDocuments.length === 0 ? (
          <div className={styles.emptyState}>
            <FontAwesomeIcon icon={faFile} size="3x" style={{ color: '#bdc3c7', marginBottom: '20px' }} />
            <h3>No documents found</h3>
            <p>
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Upload your first document to get started!'}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? styles.documentsGrid : styles.documentsList}>
            {filteredDocuments.map((document) => (
              <div key={document.id} className={viewMode === 'grid' ? styles.documentCard : styles.documentRow}>
                <div className={styles.documentIcon}>
                  <FontAwesomeIcon 
                    icon={getFileIcon(document.type || document.file_type)} 
                    size="2x"
                    style={{ color: '#3498db' }}
                  />
                </div>
                
                <div className={styles.documentInfo}>
                  <h4 className={styles.documentName}>{document.name}</h4>
                  <div className={styles.documentMeta}>
                    <span className={styles.documentSize}>
                      {formatFileSize(document.size || document.file_size || 0)}
                    </span>
                    <span className={styles.documentDate}>
                      {formatDate(document.uploadDate || document.upload_date)}
                    </span>
                  </div>
                  {document.description && (
                    <p className={styles.documentDescription}>{document.description}</p>
                  )}
                </div>

                <div className={styles.documentActions}>
                  <button
                    onClick={() => handleView(document)}
                    className={`${styles.actionButton} ${styles.viewButton}`}
                    title="View/Download"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  
                  <button
                    onClick={() => handleEdit(document)}
                    className={`${styles.actionButton} ${styles.editButton}`}
                    title="Edit"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(document.id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && selectedDocument && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Edit Document</h3>
                <button onClick={handleCancelEdit} className={styles.modalClose}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Document Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={styles.formInput}
                    placeholder="Enter document name"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Description (Optional)</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className={styles.formTextarea}
                    placeholder="Enter document description"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button onClick={handleCancelEdit} className={styles.cancelButton}>
                  <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} />
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className={styles.saveButton}>
                  <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DocumentManager;
