import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  documents: [],
  tasks: [
    { id: 1, title: 'Setup Project Structure', status: 'completed', assignee: 'John', priority: 'high', category: 'development', dueDate: '2025-01-15' },
    { id: 2, title: 'Create API Documentation', status: 'in-progress', assignee: 'Sarah', priority: 'medium', category: 'documentation', dueDate: '2025-01-20' },
    { id: 3, title: 'Implement Authentication', status: 'pending', assignee: 'Mike', priority: 'high', category: 'development', dueDate: '2025-01-25' },
    { id: 4, title: 'Design User Interface', status: 'in-progress', assignee: 'Lisa', priority: 'low', category: 'design', dueDate: '2025-01-30' },
    { id: 5, title: 'Write Test Cases', status: 'pending', assignee: 'Alex', priority: 'medium', category: 'testing', dueDate: '2025-02-05' }
  ],
  teamMembers: ['John', 'Sarah', 'Mike', 'Lisa', 'Alex'],
  loading: false,
  error: null,
  notifications: []
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Document actions
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  
  // Task actions
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  SET_TASKS: 'SET_TASKS',
  
  // Notification actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
      
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    // Document actions
    case ActionTypes.ADD_DOCUMENT:
      return {
        ...state,
        documents: [...state.documents, { ...action.payload, id: Date.now() }]
      };
      
    case ActionTypes.UPDATE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id ? { ...doc, ...action.payload } : doc
        )
      };
      
    case ActionTypes.DELETE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload)
      };
      
    case ActionTypes.SET_DOCUMENTS:
      return { ...state, documents: action.payload };

    // Task actions
    case ActionTypes.ADD_TASK:
      return {
        ...state,
        tasks: [...state.tasks, { ...action.payload, id: Date.now() }]
      };
      
    case ActionTypes.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        )
      };
      
    case ActionTypes.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
      
    case ActionTypes.SET_TASKS:
      return { ...state, tasks: action.payload };

    // Notification actions
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, { ...action.payload, id: Date.now() }]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
      
    case ActionTypes.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedDocuments = localStorage.getItem('collaborationPortal_documents');
      const savedTasks = localStorage.getItem('collaborationPortal_tasks');
      
      if (savedDocuments) {
        dispatch({ type: ActionTypes.SET_DOCUMENTS, payload: JSON.parse(savedDocuments) });
      }
      
      if (savedTasks) {
        dispatch({ type: ActionTypes.SET_TASKS, payload: JSON.parse(savedTasks) });
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('collaborationPortal_documents', JSON.stringify(state.documents));
    } catch (error) {
      console.error('Error saving documents to localStorage:', error);
    }
  }, [state.documents]);

  useEffect(() => {
    try {
      localStorage.setItem('collaborationPortal_tasks', JSON.stringify(state.tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }, [state.tasks]);

  // Action creators
  const actions = {
    // Loading and error actions
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),

    // Document actions
    addDocument: (document) => {
      dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: document });
      actions.addNotification({
        type: 'success',
        message: `Document "${document.name}" uploaded successfully!`
      });
    },
    updateDocument: (document) => dispatch({ type: ActionTypes.UPDATE_DOCUMENT, payload: document }),
    deleteDocument: (id) => {
      dispatch({ type: ActionTypes.DELETE_DOCUMENT, payload: id });
      actions.addNotification({
        type: 'info',
        message: 'Document deleted successfully'
      });
    },

    // Task actions
    addTask: (task) => {
      dispatch({ type: ActionTypes.ADD_TASK, payload: { ...task, status: 'pending' } });
      actions.addNotification({
        type: 'success',
        message: `Task "${task.title}" created successfully!`
      });
    },
    updateTask: (task) => {
      dispatch({ type: ActionTypes.UPDATE_TASK, payload: task });
      actions.addNotification({
        type: 'info',
        message: `Task "${task.title}" updated`
      });
    },
    deleteTask: (id) => {
      const task = state.tasks.find(t => t.id === id);
      dispatch({ type: ActionTypes.DELETE_TASK, payload: id });
      actions.addNotification({
        type: 'info',
        message: `Task "${task?.title}" deleted`
      });
    },

    // Notification actions
    addNotification: (notification) => {
      dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        actions.removeNotification(Date.now());
      }, 5000);
    },
    removeNotification: (id) => dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id }),
    clearNotifications: () => dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS })
  };

  // Computed values
  const computed = {
    completedTasks: state.tasks.filter(task => task.status === 'completed'),
    inProgressTasks: state.tasks.filter(task => task.status === 'in-progress'),
    pendingTasks: state.tasks.filter(task => task.status === 'pending'),
    highPriorityTasks: state.tasks.filter(task => task.priority === 'high'),
    recentDocuments: state.documents.slice(-5).reverse(),
    tasksByAssignee: state.teamMembers.reduce((acc, member) => {
      acc[member] = state.tasks.filter(task => task.assignee === member);
      return acc;
    }, {}),
    taskStats: {
      total: state.tasks.length,
      completed: state.tasks.filter(task => task.status === 'completed').length,
      inProgress: state.tasks.filter(task => task.status === 'in-progress').length,
      pending: state.tasks.filter(task => task.status === 'pending').length
    }
  };

  const value = {
    ...state,
    ...actions,
    computed
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export { ActionTypes };