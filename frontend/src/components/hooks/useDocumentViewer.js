import { useState, useEffect, useCallback } from 'react';
import { useDocumentViewer as useViewerContext } from '../contexts/DocumentViewerContext';
import documentService from '../services/documentService';

/**
 * Custom hook for document viewing functionality
 * Handles document loading, permissions, and viewer state
 */
const useDocumentViewer = () => {
  const { openDocument: openViewer, closeDocument: closeViewer } = useViewerContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState({ hasPermission: true });
  const [currentDocument, setCurrentDocument] = useState(null);

  /**
   * Check if user has permission to view a document
   * @param {string} documentId - ID of the document to check
   * @returns {Promise<boolean>} Whether the user has permission
   */
  const checkPermission = useCallback(async (documentId) => {
    try {
      const permission = await documentService.checkViewPermission(documentId);
      setPermission(permission);
      return permission.hasPermission;
    } catch (err) {
      console.error('Error checking permission:', err);
      setError('Failed to check document permissions');
      return false;
    }
  }, []);

  /**
   * Open a document in the viewer
   * @param {Object} document - Document object to view
   * @param {boolean} checkPermissions - Whether to check permissions before opening
   */
  const openDocument = useCallback(async (document, checkPermissions = true) => {
    if (!document) return;
    
    setIsLoading(true);
    setError(null);
    setCurrentDocument(document);

    try {
      // If we need to check permissions
      if (checkPermissions && document.id) {
        const hasPermission = await checkPermission(document.id);
        if (!hasPermission) {
          setError('You do not have permission to view this document');
          setIsLoading(false);
          return;
        }
      }

      // Get the preview URL
      const previewUrl = documentService.getPreviewUrl(document);
      const downloadUrl = documentService.getDownloadUrl(document.id);
      
      // Open the document in the viewer
      openViewer({
        id: document.id,
        name: document.title || document.name,
        type: document.doc_type || document.file_type,
        size: document.file_size || document.size,
        url: previewUrl,
        downloadUrl,
        uploadedAt: document.datetime_uploaded || document.upload_date,
        uploadedBy: document.uploaded_by,
        lastModified: document.date_last_modified,
        lastModifiedBy: document.last_modified_by,
      });

    } catch (err) {
      console.error('Error opening document:', err);
      setError('Failed to open document');
    } finally {
      setIsLoading(false);
    }
  }, [checkPermission, openViewer]);

  /**
   * Close the document viewer
   */
  const closeDocument = useCallback(() => {
    closeViewer();
    setCurrentDocument(null);
    setError(null);
  }, [closeViewer]);

  /**
   * Download the current document
   */
  const downloadDocument = useCallback(async () => {
    if (!currentDocument?.id) return;
    
    try {
      setIsLoading(true);
      const blob = await documentService.downloadDocument(currentDocument.id);
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentDocument.name || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document');
    } finally {
      setIsLoading(false);
    }
  }, [currentDocument]);

  /**
   * Get users with access to the current document
   */
  const getDocumentAccessList = useCallback(async () => {
    if (!currentDocument?.id) return [];
    
    try {
      return await documentService.getDocumentAccessList(currentDocument.id);
    } catch (err) {
      console.error('Error getting document access list:', err);
      setError('Failed to load document access list');
      return [];
    }
  }, [currentDocument]);

  /**
   * Update document access for a user
   */
  const updateDocumentAccess = useCallback(async (userId, canView = true) => {
    if (!currentDocument?.id) return null;
    
    try {
      return await documentService.updateDocumentAccess(currentDocument.id, userId, canView);
    } catch (err) {
      console.error('Error updating document access:', err);
      setError('Failed to update document access');
      throw err;
    }
  }, [currentDocument]);

  return {
    // State
    isLoading,
    error,
    currentDocument,
    permission,
    
    // Actions
    openDocument,
    closeDocument,
    downloadDocument,
    getDocumentAccessList,
    updateDocumentAccess,
    checkPermission,
  };
};

export default useDocumentViewer;
