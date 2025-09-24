import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faLink, faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import documentService from './services/documentService';
import styles from './Dashboard.module.css';

const UploadCollabDoc = ({ projectId }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [description, setDescription] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadStatus(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus({ type: 'info', message: 'Uploading document...' });

    try {
      // Simulate upload progress (in a real app, you'd use axios with onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10) + 5;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Upload the document
      await documentService.uploadDocument(file, projectId, description);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus({ 
        type: 'success', 
        message: 'Document uploaded successfully!' 
      });
      
      // Reset form after successful upload
      setTimeout(() => {
        setFile(null);
        setDescription('');
        setUploadProgress(0);
        setTimeout(() => setUploadStatus(null), 3000);
      }, 1500);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus({ 
        type: 'error', 
        message: error.message || 'Failed to upload document. Please try again.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus(null);
  };

  const handleBrowseClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif';
    input.onchange = (e) => {
      if (e.target.files.length > 0) {
        setFile(e.target.files[0]);
        setUploadStatus(null);
      }
    };
    input.click();
  };

  return (
    <div className={styles.uploadContainer}>
      <h2 className={styles.pageTitle}>
        <FontAwesomeIcon icon={faCloudUploadAlt} className={styles.titleIcon} />
        Upload Document
      </h2>
      
      <div className={styles.simpleUploadContainer}>
        {!file ? (
          <div className={styles.uploadCard}>
            <div className={styles.uploadHeader}>
              <FontAwesomeIcon icon={faCloudUploadAlt} className={styles.uploadHeaderIcon} />
              <h3>Upload Document</h3>
            </div>

            {/* Drag and Drop Area */}
            <div 
              {...getRootProps()} 
              className={`${styles.simpleDropzone} ${isDragActive ? styles.dropzoneActive : ''}`}
            >
              <input {...getInputProps()} />
              <FontAwesomeIcon icon={faCloudUploadAlt} className={styles.dropzoneIcon} />
              <p>Drag and drop your file here</p>
            </div>

            {/* OR Divider */}
            <div className={styles.simpleDivider}>
              <span>OR</span>
            </div>

            {/* Browse Button */}
            <button 
              type="button" 
              onClick={handleBrowseClick}
              className={styles.simpleBrowseButton}
            >
              <FontAwesomeIcon icon={faCloudUploadAlt} />
              Choose File
            </button>

            {/* File Info */}
            <div className={styles.fileInfo}>
              <p>Supported: PDF, DOC, DOCX, XLS, XLSX, TXT, Images</p>
              <p>Maximum size: 25MB</p>
            </div>
          </div>
        ) : (
          <div className={styles.filePreview}>
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>
                {file.name}
              </span>
              <span className={styles.fileSize}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button 
                type="button" 
                onClick={removeFile}
                className={styles.removeButton}
                disabled={isUploading}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.descriptionInput}>
              <label htmlFor="description">Description (optional):</label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description..."
                disabled={isUploading}
              />
            </div>

            {uploadProgress > 0 && (
              <div className={styles.progressContainer}>
                <div 
                  className={`${styles.progressBar} ${uploadStatus?.type === 'success' ? styles.progressSuccess : ''}`}
                  style={{ width: `${uploadProgress}%` }}
                />
                <span className={styles.progressText}>
                  {uploadStatus?.type === 'success' ? 'Complete!' : `${uploadProgress}%`}
                </span>
              </div>
            )}

            {uploadStatus && (
              <div className={`${styles.statusMessage} ${styles[`status${uploadStatus.type}`]}`}>
                {uploadStatus.message}
              </div>
            )}
          </div>
        )}

        <div className={styles.uploadActions}>
          {!file ? (
            <div className={styles.orDivider}>
              <span>or</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className={`${styles.uploadButton} ${isUploading ? styles.uploading : ''}`}
              disabled={!file || isUploading}
            >
              {isUploading ? (
                'Uploading...'
              ) : (
                <>
                  <FontAwesomeIcon icon={faCloudUploadAlt} />
                  Upload Document
                </>
              )}
            </button>
          )}
          
          <button 
            type="button" 
            className={styles.linkButton}
            onClick={() => alert('SharePoint integration coming soon!')}
          >
            <FontAwesomeIcon icon={faLink} />
            Add SharePoint Link
          </button>
        </div>
      </div>

      <div className={styles.uploadGuidelines}>
        <h4>Upload Guidelines</h4>
        <ul>
          <li>Maximum file size: 25MB</li>
          <li>Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, Images</li>
          <li>Ensure documents don't contain sensitive information</li>
          <li>Use clear and descriptive filenames</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadCollabDoc;
