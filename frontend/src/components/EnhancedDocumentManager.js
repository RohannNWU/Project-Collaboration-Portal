import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, faDownload, faEdit, faTrash, faUpload, faPlus, 
  faTasks, faLock, faUnlock, faSearch, faFilter, faSort,
  faFile, faFileAlt, faFilePdf, faFileImage, faFileWord
} from '@fortawesome/free-solid-svg-icons';
import documentService from '../services/documentService';
import { useApp } from '../context/AppContext';
// Using inline styles for now - can be moved to CSS module later
const styles = {
  container: 'document-manager-container',
  header: 'document-manager-header',
  title: 'document-manager-title',
  subtitle: 'document-manager-subtitle',
  controls: 'document-manager-controls',
  viewToggle: 'view-toggle',
  toggleButton: 'toggle-button',
  active: 'active',
  searchFilter: 'search-filter',
  searchBox: 'search-box',
  filterSelect: 'filter-select',
  uploadButton: 'upload-button',
  tasksView: 'tasks-view',
  taskCard: 'task-card',
  taskHeader: 'task-header',
  taskInfo: 'task-info',
  taskName: 'task-name',
  projectName: 'project-name',
  taskDescription: 'task-description',
  taskMeta: 'task-meta',
  badge: 'badge',
  badgeSuccess: 'badge-success',
  badgeWarning: 'badge-warning',
  badgeDanger: 'badge-danger',
  badgeInfo: 'badge-info',
  dueDate: 'due-date',
  documentsSection: 'documents-section',
  documentsTitle: 'documents-title',
  addDocButton: 'add-doc-button',
  noDocuments: 'no-documents',
  documentsList: 'documents-list',
  documentItem: 'document-item',
  documentInfo: 'document-info',
  fileIcon: 'file-icon',
  documentDetails: 'document-details',
  documentTitle: 'document-title',
  documentMeta: 'document-meta',
  description: 'description',
  size: 'size',
  uploader: 'uploader',
  uploadDate: 'upload-date',
  documentActions: 'document-actions',
  actionButton: 'action-button',
  viewButton: 'view-button',
  downloadButton: 'download-button',
  editButton: 'edit-button',
  deleteButton: 'delete-button',
  documentsView: 'documents-view',
  documentsGrid: 'documents-grid',
  documentCard: 'document-card',
  documentCardHeader: 'document-card-header',
  accessIndicator: 'access-indicator',
  documentCardBody: 'document-card-body',
  taskInfo: 'task-info',
  projectInfo: 'project-info',
  documentCardActions: 'document-card-actions',
  modal: 'modal',
  modalContent: 'modal-content',
  modalHeader: 'modal-header',
  closeButton: 'close-button',
  modalBody: 'modal-body',
  formGroup: 'form-group',
  modalFooter: 'modal-footer',
  cancelButton: 'cancel-button',
  statistics: 'statistics',
  statCard: 'stat-card',
  statNumber: 'stat-number',
  loading: 'loading',
  spinner: 'spinner',
  emptyState: 'empty-state'
};

const EnhancedDocumentManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('upload_date');
  const [viewMode, setViewMode] = useState('tasks'); // 'tasks' or 'documents'
  const appContext = useApp();

  useEffect(() => {
    loadTasksWithDocuments();
  }, []);

  const loadTasksWithDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getUserTasksWithDocuments();
      setTasks(data.tasks || []);
      
      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'success',
          message: `Loaded ${data.tasks?.length || 0} tasks with documents`
        });
      }
    } catch (error) {
      console.error('Failed to load tasks with documents:', error);
      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'error',
          message: 'Failed to load tasks and documents. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadToTask = async () => {
    if (!selectedTask || !uploadFile) {
      alert('Please select a task and file to upload');
      return;
    }

    try {
      setLoading(true);
      await documentService.uploadTaskDocument(
        selectedTask.task_id,
        uploadFile,
        uploadTitle,
        uploadDescription
      );

      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'success',
          message: `Document uploaded successfully to task: ${selectedTask.task_name}`
        });
      }

      // Reset upload form
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setSelectedTask(null);

      // Reload tasks
      await loadTasksWithDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'error',
          message: 'Failed to upload document. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async (document) => {
    try {
      await documentService.viewDocument(document);
      
      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'success',
          message: 'Document opened for viewing'
        });
      }
    } catch (error) {
      console.error('Failed to view document:', error);
      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'error',
          message: 'Failed to view document. Please try again.'
        });
      }
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      setLoading(true);
      const blob = await documentService.downloadDocument(document);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.title || document.filename || `document_${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (appContext.addNotification) {
        appContext.addNotification({
          type: 'success',
          message: 'Document downloaded successfully'
        });
      }
    } catch (error) {
      console.error('Failed to download document:', error);
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

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return faFilePdf;
    if (fileType?.includes('image')) return faFileImage;
    if (fileType?.includes('word') || fileType?.includes('doc')) return faFileWord;
    if (fileType?.includes('text')) return faFileAlt;
    return faFile;
  };

  const getAccessLevelBadge = (task) => {
    return task.access_level === 'full' ? (
      <span className={`${styles.badge} ${styles.badgeSuccess}`}>
        <FontAwesomeIcon icon={faUnlock} /> Full Access
      </span>
    ) : (
      <span className={`${styles.badge} ${styles.badgeWarning}`}>
        <FontAwesomeIcon icon={faLock} /> Read Only
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClass = priority?.toLowerCase() === 'high' ? styles.badgeDanger :
                         priority?.toLowerCase() === 'medium' ? styles.badgeWarning :
                         styles.badgeInfo;
    
    return (
      <span className={`${styles.badge} ${priorityClass}`}>
        {priority || 'Normal'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase() === 'completed' ? styles.badgeSuccess :
                       status?.toLowerCase() === 'in_progress' ? styles.badgeWarning :
                       styles.badgeInfo;
    
    return (
      <span className={`${styles.badge} ${statusClass}`}>
        {status || 'Pending'}
      </span>
    );
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.documents.some(doc => 
                           doc.title.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'assigned' && task.access_level === 'full') ||
                         (filterType === 'readonly' && task.access_level === 'read_only') ||
                         (filterType === 'with_docs' && task.documents.length > 0);
    
    return matchesSearch && matchesFilter;
  });

  const allDocuments = tasks.flatMap(task => 
    task.documents.map(doc => ({
      ...doc,
      task_name: task.task_name,
      project_name: task.project_name,
      access_level: task.access_level,
      task_priority: task.task_priority,
      task_status: task.task_status
    }))
  );

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.project_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'assigned' && doc.access_level === 'full') ||
                         (filterType === 'readonly' && doc.access_level === 'read_only');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading task documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FontAwesomeIcon icon={faTasks} /> Task Document Manager
        </h1>
        <p className={styles.subtitle}>
          🔐 Role-Based Access • 📁 Task-Centric Management • 🔍 Audit-Friendly
        </p>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleButton} ${viewMode === 'tasks' ? styles.active : ''}`}
            onClick={() => setViewMode('tasks')}
          >
            <FontAwesomeIcon icon={faTasks} /> Tasks View
          </button>
          <button
            className={`${styles.toggleButton} ${viewMode === 'documents' ? styles.active : ''}`}
            onClick={() => setViewMode('documents')}
          >
            <FontAwesomeIcon icon={faFile} /> Documents View
          </button>
        </div>

        <div className={styles.searchFilter}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search tasks, projects, or documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Items</option>
            <option value="assigned">My Assigned Tasks</option>
            <option value="readonly">Read-Only Access</option>
            <option value="with_docs">Tasks with Documents</option>
          </select>
        </div>

        <button
          className={styles.uploadButton}
          onClick={() => setShowUploadModal(true)}
          disabled={!tasks.some(task => task.can_upload)}
        >
          <FontAwesomeIcon icon={faPlus} /> Upload Document
        </button>
      </div>

      {/* Tasks View */}
      {viewMode === 'tasks' && (
        <div className={styles.tasksView}>
          {filteredTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faTasks} size="3x" />
              <h3>No tasks found</h3>
              <p>No tasks match your current search and filter criteria.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.task_id} className={styles.taskCard}>
                <div className={styles.taskHeader}>
                  <div className={styles.taskInfo}>
                    <h3 className={styles.taskName}>{task.task_name}</h3>
                    <p className={styles.projectName}>Project: {task.project_name}</p>
                    <p className={styles.taskDescription}>{task.task_description}</p>
                  </div>
                  <div className={styles.taskMeta}>
                    {getAccessLevelBadge(task)}
                    {getPriorityBadge(task.task_priority)}
                    {getStatusBadge(task.task_status)}
                    <span className={styles.dueDate}>
                      Due: {task.task_due_date ? new Date(task.task_due_date).toLocaleDateString() : 'No due date'}
                    </span>
                  </div>
                </div>

                <div className={styles.documentsSection}>
                  <h4 className={styles.documentsTitle}>
                    Documents ({task.documents.length})
                    {task.can_upload && (
                      <button
                        className={styles.addDocButton}
                        onClick={() => {
                          setSelectedTask(task);
                          setShowUploadModal(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} /> Add Document
                      </button>
                    )}
                  </h4>

                  {task.documents.length === 0 ? (
                    <p className={styles.noDocuments}>No documents uploaded for this task.</p>
                  ) : (
                    <div className={styles.documentsList}>
                      {task.documents.map((document, index) => (
                        <div key={index} className={styles.documentItem}>
                          <div className={styles.documentInfo}>
                            <FontAwesomeIcon 
                              icon={getFileIcon(document.type)} 
                              className={styles.fileIcon}
                            />
                            <div className={styles.documentDetails}>
                              <h5 className={styles.documentTitle}>{document.title}</h5>
                              <p className={styles.documentMeta}>
                                {document.description && (
                                  <span className={styles.description}>{document.description}</span>
                                )}
                                <span className={styles.size}>
                                  {(document.size / 1024).toFixed(1)} KB
                                </span>
                                <span className={styles.uploader}>
                                  by {document.uploader}
                                </span>
                                <span className={styles.uploadDate}>
                                  {new Date(document.upload_date).toLocaleDateString()}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className={styles.documentActions}>
                            <button
                              onClick={() => handleViewDocument(document)}
                              className={`${styles.actionButton} ${styles.viewButton}`}
                              title="View Document"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            
                            <button
                              onClick={() => handleDownloadDocument(document)}
                              className={`${styles.actionButton} ${styles.downloadButton}`}
                              title="Download Document"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </button>

                            {document.can_edit && (
                              <button
                                className={`${styles.actionButton} ${styles.editButton}`}
                                title="Edit Document"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                            )}

                            {document.can_delete && (
                              <button
                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                title="Delete Document"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Documents View */}
      {viewMode === 'documents' && (
        <div className={styles.documentsView}>
          {filteredDocuments.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faFile} size="3x" />
              <h3>No documents found</h3>
              <p>No documents match your current search and filter criteria.</p>
            </div>
          ) : (
            <div className={styles.documentsGrid}>
              {filteredDocuments.map((document, index) => (
                <div key={index} className={styles.documentCard}>
                  <div className={styles.documentCardHeader}>
                    <FontAwesomeIcon 
                      icon={getFileIcon(document.type)} 
                      className={styles.fileIcon}
                    />
                    <div className={styles.accessIndicator}>
                      {document.access_level === 'full' ? (
                        <FontAwesomeIcon icon={faUnlock} title="Full Access" />
                      ) : (
                        <FontAwesomeIcon icon={faLock} title="Read Only" />
                      )}
                    </div>
                  </div>

                  <div className={styles.documentCardBody}>
                    <h4 className={styles.documentTitle}>{document.title}</h4>
                    <p className={styles.taskInfo}>
                      <strong>Task:</strong> {document.task_name}
                    </p>
                    <p className={styles.projectInfo}>
                      <strong>Project:</strong> {document.project_name}
                    </p>
                    {document.description && (
                      <p className={styles.description}>{document.description}</p>
                    )}
                    <div className={styles.documentMeta}>
                      <span className={styles.size}>
                        {(document.size / 1024).toFixed(1)} KB
                      </span>
                      <span className={styles.uploader}>
                        by {document.uploader}
                      </span>
                      <span className={styles.uploadDate}>
                        {new Date(document.upload_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className={styles.documentCardActions}>
                    <button
                      onClick={() => handleViewDocument(document)}
                      className={`${styles.actionButton} ${styles.viewButton}`}
                      title="View Document"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    
                    <button
                      onClick={() => handleDownloadDocument(document)}
                      className={`${styles.actionButton} ${styles.downloadButton}`}
                      title="Download Document"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </button>

                    {document.can_edit && (
                      <button
                        className={`${styles.actionButton} ${styles.editButton}`}
                        title="Edit Document"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    )}

                    {document.can_delete && (
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Delete Document"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Upload Document to Task</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedTask(null);
                  setUploadFile(null);
                  setUploadTitle('');
                  setUploadDescription('');
                }}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Select Task:</label>
                <select
                  value={selectedTask?.task_id || ''}
                  onChange={(e) => {
                    const task = tasks.find(t => t.task_id === parseInt(e.target.value));
                    setSelectedTask(task);
                  }}
                  required
                >
                  <option value="">Choose a task...</option>
                  {tasks.filter(task => task.can_upload).map(task => (
                    <option key={task.task_id} value={task.task_id}>
                      {task.task_name} ({task.project_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>File:</label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Title:</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Document title (optional)"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description:</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Document description (optional)"
                  rows="3"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedTask(null);
                  setUploadFile(null);
                  setUploadTitle('');
                  setUploadDescription('');
                }}
              >
                Cancel
              </button>
              <button
                className={styles.uploadButton}
                onClick={handleUploadToTask}
                disabled={!selectedTask || !uploadFile}
              >
                <FontAwesomeIcon icon={faUpload} /> Upload Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className={styles.statistics}>
        <div className={styles.statCard}>
          <h4>Total Tasks</h4>
          <p className={styles.statNumber}>{tasks.length}</p>
        </div>
        <div className={styles.statCard}>
          <h4>Assigned Tasks</h4>
          <p className={styles.statNumber}>
            {tasks.filter(task => task.access_level === 'full').length}
          </p>
        </div>
        <div className={styles.statCard}>
          <h4>Total Documents</h4>
          <p className={styles.statNumber}>{allDocuments.length}</p>
        </div>
        <div className={styles.statCard}>
          <h4>Read-Only Access</h4>
          <p className={styles.statNumber}>
            {tasks.filter(task => task.access_level === 'read_only').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDocumentManager;
