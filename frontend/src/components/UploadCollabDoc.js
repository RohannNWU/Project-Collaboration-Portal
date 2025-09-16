import React, { useState } from 'react';
import Layout from './layout/Layout';
import Card from './common/Card';
import Button from './common/Button';
import Alert from './common/Alert';
import Loading from './common/Loading';
import { useApp } from '../context/AppContext';
import styles from '../styles/common.module.css';

const UploadCollabDoc = () => {
  const { addDocument, loading, setLoading } = useApp();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [dragOver, setDragOver] = useState(false);

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

    setLoading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const document = {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        uploadDate: new Date().toISOString(),
        uploadedBy: 'Current User'
      };
      
      addDocument(document);
      setSelectedFile(null);
      setUploadStatus('');
      setLoading(false);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }, 1500);
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Upload Area */}
        <Card className={styles.mb4}>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
              border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-gray)'}`,
              borderRadius: 'var(--border-radius-lg)',
              padding: 'var(--spacing-xxxl)',
              textAlign: 'center',
              backgroundColor: dragOver ? 'var(--color-primary-light)' : 'var(--bg-secondary)',
              transition: 'all var(--transition-normal)',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: 'var(--font-size-display)', marginBottom: 'var(--spacing-md)' }}>
              📁
            </div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
              {dragOver ? 'Drop your file here' : 'Upload Your Document'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              Drag and drop a file here, or click to select a file
            </p>
            
            <input 
              type="file" 
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.pptx,.ppt"
              style={{ display: 'none' }}
              id="fileInput"
            />
            <label htmlFor="fileInput">
              <Button variant="primary" size="lg" style={{ pointerEvents: 'none' }}>
                📎 Choose File
              </Button>
            </label>
            
            {selectedFile && (
              <div style={{ 
                marginTop: 'var(--spacing-lg)', 
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--border-radius-md)',
                border: 'var(--border)'
              }}>
                <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-success)' }}>
                  ✅ File Selected
                </h4>
                <p style={{ margin: '0 0 var(--spacing-xs) 0' }}>
                  <strong>Name:</strong> {selectedFile.name}
                </p>
                <p style={{ margin: '0 0 var(--spacing-md) 0' }}>
                  <strong>Size:</strong> {formatFileSize(selectedFile.size)}
                </p>
                <Button onClick={handleUpload} variant="success" size="lg">
                  🚀 Upload Document
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Status Messages */}
        {uploadStatus && (
          <Alert 
            variant={uploadStatus.includes('successfully') ? 'success' : 'danger'}
            onClose={() => setUploadStatus('')}
            className={styles.mb4}
          >
            {uploadStatus}
          </Alert>
        )}

        {/* Supported File Types */}
        <Card title="Supported File Types" subtitle="Upload any of these document formats">
          <div className={`${styles.grid} ${styles.gridCols2}`}>
            {supportedTypes.map((type, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--border-radius-md)',
                  marginBottom: 'var(--spacing-sm)'
                }}
              >
                <span style={{ fontSize: 'var(--font-size-xl)' }}>{type.icon}</span>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {type.description}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {type.extension}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upload Guidelines */}
        <Card title="Upload Guidelines" className={styles.mt4}>
          <div className={`${styles.grid} ${styles.gridCols2}`} style={{ gap: 'var(--spacing-xl)' }}>
            <div>
              <h4 style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-sm)' }}>
                ✅ Best Practices
              </h4>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Use descriptive file names</li>
                <li>Keep file sizes under 50MB</li>
                <li>Use standard document formats</li>
                <li>Include version numbers when applicable</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--color-warning)', marginBottom: 'var(--spacing-sm)' }}>
                ⚠️ Important Notes
              </h4>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Files are stored locally in your browser</li>
                <li>Large files may take longer to upload</li>
                <li>Ensure files don't contain sensitive data</li>
                <li>Duplicate names will be automatically renamed</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default UploadCollabDoc;
