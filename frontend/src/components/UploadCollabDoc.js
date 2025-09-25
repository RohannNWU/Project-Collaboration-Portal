import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from './layout/Layout';
import Loading from './common/Loading';
import documentService from '../services/documentService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUpload, faFile, faCheckCircle, faCloudUploadAlt, faFileAlt,
  faFilePdf, faFileWord, faFileExcel, faFilePowerpoint, faFileCode,
  faTrash, faEye, faDownload, faUsers, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import dashboardStyles from './Dashboard.module.css';

const UploadCollabDoc = () => {
  const { addDocument, loading, setLoading } = useApp();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskId, setTaskId] = useState(''); // New state for task_id

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      return; // No status display as per original
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('description', description);
      if (taskId.trim()) {
        formData.append('task_id', taskId); // Add task_id to payload
      }

      // Log payload for debugging
      console.log('Uploading document with:', { title, description, taskId, file: selectedFile.name });

      const response = await documentService.uploadDocument(selectedFile, null, title, description, taskId);
      
      // Add to local context for immediate UI update
      const newDocument = {
        document_id: response.data.document_id,
        document_title: title,
        document_description: description,
        task_id: taskId || null
      };
      addDocument(newDocument);
      
      // Reset form
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setTaskId(''); // Reset task_id
    } catch (error) {
      console.error('Upload error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className={dashboardStyles.container}>
        <section className={dashboardStyles.panel}>
          <div className={dashboardStyles.panelHead}>
            <h3>Upload Document</h3>
            <FontAwesomeIcon icon={faCloudUploadAlt} />
          </div>
          <div
            className={`${dashboardStyles.uploadArea} ${dragOver ? dashboardStyles.dragOver : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <FontAwesomeIcon icon={faUpload} size="3x" style={{ color: '#6c757d' }} />
            <p>Drag and drop a file here or click to select</p>
            <input
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="fileInput"
            />
            <label htmlFor="fileInput" className={dashboardStyles.uploadBtn}>
              Select File
            </label>
            {selectedFile && (
              <p style={{ marginTop: '10px' }}>
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          <div className={dashboardStyles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              required
            />
          </div>
          <div className={dashboardStyles.formGroup}>
            <label>Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description"
            />
          </div>
          <div className={dashboardStyles.formGroup}>
            <label>Task ID (optional)</label>
            <input
              type="text"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Enter task ID"
            />
          </div>
          <button
            onClick={handleUpload}
            className={dashboardStyles.uploadBtn}
            disabled={loading || !selectedFile || !title.trim()}
          >
            {loading ? <Loading /> : 'Upload Document'}
          </button>
        </section>
        <section className={dashboardStyles.panel}>
          <div className={dashboardStyles.panelHead}>
            <h3>Supported Formats</h3>
            <FontAwesomeIcon icon={faFile} />
          </div>
          <div className={dashboardStyles.formats}>
            <p><FontAwesomeIcon icon={faFilePdf} /> PDF</p>
            <p><FontAwesomeIcon icon={faFileWord} /> Word</p>
            <p><FontAwesomeIcon icon={faFileExcel} /> Excel</p>
            <p><FontAwesomeIcon icon={faFilePowerpoint} /> PowerPoint</p>
            <p><FontAwesomeIcon icon={faFileCode} /> Code</p>
          </div>
        </section>
        <section className={dashboardStyles.panel}>
          <div className={dashboardStyles.twoColumn}>
            <div style={{
              padding: '20px',
              backgroundColor: '#e8f4f8',
              borderRadius: '8px',
              border: '1px solid #b8d4e3'
            }}>
              <h4 style={{ 
                color: '#2c3e50', 
                marginBottom: '15px',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px' }} />
                Best Practices
              </h4>
              <ul style={{ 
                color: '#2c3e50', 
                paddingLeft: '20px',
                lineHeight: '1.6',
                margin: '0'
              }}>
                <li>Use descriptive file names</li>
                <li>Keep file sizes under 50MB</li>
                <li>Use standard document formats</li>
                <li>Include version numbers when applicable</li>
              </ul>
            </div>
            <div style={{
              padding: '20px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffeaa7'
            }}>
              <h4 style={{ 
                color: '#e67e22', 
                marginBottom: '15px',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center'
              }}>
                <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '8px' }} />
                Important Notes
              </h4>
              <ul style={{ 
                color: '#2c3e50', 
                paddingLeft: '20px',
                lineHeight: '1.6',
                margin: '0'
              }}>
                <li>Files are stored locally in your browser</li>
                <li>Large files may take longer to upload</li>
                <li>Ensure files don't contain sensitive data</li>
                <li>Duplicate names will be automatically renamed</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default UploadCollabDoc;