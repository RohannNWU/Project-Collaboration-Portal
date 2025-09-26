import React, { createContext, useContext, useState } from 'react';

const DocumentViewerContext = createContext();

export const DocumentViewerProvider = ({ children }) => {
  const [document, setDocument] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDocument = (doc) => {
    setDocument(doc);
    setIsOpen(true);
  };

  const closeDocument = () => {
    setIsOpen(false);
    // Small delay to allow animations to complete before resetting the document
    setTimeout(() => setDocument(null), 300);
  };

  return (
    <DocumentViewerContext.Provider
      value={{
        openDocument,
        closeDocument,
        document,
        isOpen,
      }}
    >
      {children}
    </DocumentViewerContext.Provider>
  );
};

export const useDocumentViewer = () => {
  const context = useContext(DocumentViewerContext);
  if (!context) {
    throw new Error('useDocumentViewer must be used within a DocumentViewerProvider');
  }
  return context;
};
