import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from './layout/Layout';
import Loading from './common/Loading';
import documentService from '../services/documentService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, faFile, faCheckCircle, faCloudUploadAlt, faFileAlt,
  faFilePdf, faFileWord, faFileExcel, faFilePowerpoint, faFileCode,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import dashboardStyles from './Dashboard.module.css';

const UploadCollabDoc = () => {
  const { addDocument, loading, setLoading } = useApp();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('');
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
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    if (!title.trim()) {
      setUploadStatus('Please provide a title for the document.');
      return;
    }

    try {
      setLoading(true);
      setUploadStatus('Uploading document to server...');
      
      // Upload to backend API with title and description
      const response = await documentService.uploadDocument(selectedFile, '', title, description);
      
      // Add to local context for immediate UI update
      const newDocument = {
        id: response.document.id,
        name: response.document.title || response.document.name,
        title: response.document.title,
        size: response.document.file_size,
        type: response.document.file_type,
        uploadDate: response.document.upload_date,
        uploadedBy: 'Current User',
        description: response.document.description
      };
      
      addDocument(newDocument);
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setUploadStatus('Document uploaded successfully!');
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus('');
      }, 3000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setUploadStatus('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const supportedTypes = [
    { extension: '.pdf', description: 'PDF documents', icon: '📄' },
    { extension: '.doc, .docx', description: 'Word documents', icon: '📝' },
    { extension: '.txt', description: 'Text files', icon: '📃' },
    { extension: '.md', description: 'Markdown files', icon: '📋' },
    { extension: '.xlsx, .xls', description: 'Excel spreadsheets', icon: '📊' },
    { extension: '.pptx, .ppt', description: 'PowerPoint presentations', icon: '📈' }
  ];

  if (loading) {
    return (
      <Layout title="Upload Document" subtitle="Adding your document to the collaboration portal">
        <Loading message="Uploading your document..." size="lg" />
      </Layout>
    );
  }

  return (
    <Layout 
      title="Upload Collaborative Document" 
      subtitle="Share documents with your team for better collaboration"
    >
      {/* Modern Upload Interface - Dashboard Style */}
      <div className={dashboardStyles.main} style={{ padding: '0', background: 'transparent' }}>
        
        {/* Upload Statistics */}
        <section className={dashboardStyles.cards} style={{ marginBottom: '30px' }}>
          <div className={dashboardStyles.card} style={{ cursor: 'default' }}>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faFile} style={{ marginRight: '8px', color: '#3498db' }} />
              Total Documents
            </p>
            <h2 style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
              24
            </h2>
            <small style={{ color: '#95a5a6', fontSize: '12px' }}>In your workspace</small>
          </div>
          <div className={dashboardStyles.card} style={{ cursor: 'default' }}>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faCloudUploadAlt} style={{ marginRight: '8px', color: '#27ae60' }} />
              Recent Uploads
            </p>
            <h2 style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>
              8
            </h2>
            <small style={{ color: '#95a5a6', fontSize: '12px' }}>This week</small>
          </div>
          <div className={dashboardStyles.card} style={{ cursor: 'default' }}>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faUsers} style={{ marginRight: '8px', color: '#9b59b6' }} />
              Shared Files
            </p>
            <h2 style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#9b59b6' }}>
              16
            </h2>
            <small style={{ color: '#95a5a6', fontSize: '12px' }}>Team accessible</small>
          </div>
          <div className={dashboardStyles.card} style={{ cursor: 'default' }}>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px', color: '#e67e22' }} />
              Storage Used
            </p>
            <h2 style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#e67e22' }}>
              2.4GB
            </h2>
            <small style={{ color: '#95a5a6', fontSize: '12px' }}>of 10GB available</small>
          </div>
        </section>

        {/* Modern Upload Area */}
        <section className={dashboardStyles.panel} style={{ marginBottom: '25px' }}>
          <div className={dashboardStyles.panelHead}>
            <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '600', color: '#2c3e50' }}>
              <FontAwesomeIcon icon={faUpload} style={{ marginRight: '10px', color: '#3498db' }} />
              Upload New Document
            </h2>
          </div>
          
          <div style={{ padding: '30px' }}>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `3px dashed ${dragOver ? '#3498db' : '#bdc3c7'}`,
                borderRadius: '12px',
                padding: '50px 30px',
                textAlign: 'center',
                backgroundColor: dragOver ? '#ecf0f1' : '#f8f9fa',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <div style={{ 
                fontSize: '64px', 
                marginBottom: '20px',
                color: dragOver ? '#3498db' : '#95a5a6'
              }}>
                <FontAwesomeIcon icon={faCloudUploadAlt} />
              </div>
              <h3 style={{ 
                marginBottom: '10px', 
                color: '#2c3e50',
                fontSize: '24px',
                fontWeight: '600'
              }}>
                {dragOver ? 'Drop your file here' : 'Upload Your Document'}
              </h3>
              <p style={{ 
                color: '#7f8c8d', 
                marginBottom: '25px',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                Drag and drop a file here, or click the button below to select a file
              </p>
              
              <input 
                type="file" 
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.pptx,.ppt"
                style={{ display: 'none' }}
                id="fileInput"
              />
              <label htmlFor="fileInput">
                <button 
                  className={dashboardStyles.qaBtn}
                  style={{ 
                    pointerEvents: 'none',
                    padding: '12px 30px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  <FontAwesomeIcon icon={faFile} style={{ marginRight: '8px' }} />
                  Choose File
                </button>
              </label>
            
              {selectedFile && (
                <div style={{ 
                  marginTop: '25px', 
                  padding: '20px',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '8px',
                  border: '2px solid #27ae60',
                  textAlign: 'left'
                }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#27ae60', fontSize: '18px', fontWeight: '600' }}>
                    <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: '8px' }} />
                    File Selected
                  </h4>
                  <p style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
                    <strong>Name:</strong> {selectedFile.name}
                  </p>
                  <p style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
                    <strong>Size:</strong> {formatFileSize(selectedFile.size)}
                  </p>
                  
                  {/* Title Input */}
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                      Document Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter document title..."
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #bdc3c7',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  {/* Description Input */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter document description..."
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '2px solid #bdc3c7',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <button 
                    onClick={handleUpload}
                    className={dashboardStyles.qaBtn}
                    style={{ 
                      backgroundColor: '#27ae60',
                      borderColor: '#27ae60',
                      padding: '12px 24px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    <FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} />
                    Upload Document
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

      {/* Status Messages */}
      {uploadStatus && (
        <div style={{
          padding: '15px 20px',
          marginBottom: '25px',
          borderRadius: '8px',
          backgroundColor: uploadStatus.includes('successfully') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${uploadStatus.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`,
          color: uploadStatus.includes('successfully') ? '#155724' : '#721c24'
        }}>
          <FontAwesomeIcon 
            icon={uploadStatus.includes('successfully') ? faCheckCircle : faFileAlt} 
            style={{ marginRight: '8px' }} 
          />
          {uploadStatus}
        </div>
      )}
        {uploadStatus && (
          <div style={{
            padding: '15px 20px',
            marginBottom: '25px',
            borderRadius: '8px',
            backgroundColor: uploadStatus.includes('successfully') ? '#d4edda' : '#f8d7da',
            border: `1px solid ${uploadStatus.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`,
            color: uploadStatus.includes('successfully') ? '#155724' : '#721c24'
          }}>
            <FontAwesomeIcon 
              icon={uploadStatus.includes('successfully') ? faCheckCircle : faFileAlt} 
              style={{ marginRight: '8px' }} 
            />
            {uploadStatus}
          </div>
        )}

        {/* Supported File Types */}
        <section className={dashboardStyles.panel}>
          <div className={dashboardStyles.panelHead}>
            <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '600', color: '#2c3e50' }}>
              <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '10px', color: '#3498db' }} />
              Supported File Types
            </h2>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
              Upload any of these document formats
            </p>
          </div>
          
          <div style={{ padding: '25px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '15px' 
            }}>
              {supportedTypes.map((type, index) => {
                const getFileIcon = (extension) => {
                  if (extension.includes('pdf')) return faFilePdf;
                  if (extension.includes('doc')) return faFileWord;
                  if (extension.includes('xls')) return faFileExcel;
                  if (extension.includes('ppt')) return faFilePowerpoint;
                  return faFileCode;
                };
                
                return (
                  <div 
                    key={index}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={getFileIcon(type.extension)} 
                      style={{ fontSize: '24px', color: '#3498db' }} 
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '4px' }}>
                        {type.description}
                      </div>
                      <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                        {type.extension}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Upload Guidelines */}
        <section className={dashboardStyles.panel}>
          <div className={dashboardStyles.panelHead}>
            <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '600', color: '#2c3e50' }}>
              <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '10px', color: '#3498db' }} />
              Upload Guidelines
            </h2>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
              Follow these best practices for optimal file management
            </p>
          </div>
          
          <div style={{ padding: '25px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '25px' 
            }}>
              <div style={{
                padding: '20px',
                backgroundColor: '#e8f5e8',
                borderRadius: '8px',
                border: '1px solid #c3e6cb'
              }}>
                <h4 style={{ 
                  color: '#27ae60', 
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
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default UploadCollabDoc;
