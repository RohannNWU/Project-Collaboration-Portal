import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from './layout/Layout';
import Card from './common/Card';
import Button from './common/Button';
import Badge from './common/Badge';
import Alert from './common/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faFilter, faSort, faCheckCircle, faClock, faExclamationTriangle,
  faEdit, faTrash, faUser, faCalendarAlt, faTasks, faChartLine,
  faThLarge, faList
} from '@fortawesome/free-solid-svg-icons';
import { useApp } from '../context/AppContext';
import styles from '../styles/common.module.css';
import dashboardStyles from './Dashboard.module.css';

const TaskCardCollabDoc = () => {
  const { tasks, updateTask, deleteTask, computed } = useApp();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const navigate = useNavigate();

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'pending': return '📋';
      default: return '📋';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🌱';
      default: return '📌';
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({ ...task, status: newStatus });
    }
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
    setShowDeleteConfirm(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'status':
        return a.status.localeCompare(b.status);
      case 'assignee':
        return a.assignee.localeCompare(b.assignee);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: tasks.length },
    { value: 'pending', label: 'Pending', count: computed.pendingTasks.length },
    { value: 'in-progress', label: 'In Progress', count: computed.inProgressTasks.length },
    { value: 'completed', label: 'Completed', count: computed.completedTasks.length }
  ];

  return (
    <Layout 
      title="Task Management" 
      subtitle="Organize and track your team's tasks efficiently"
    >
      <div className={dashboardStyles.main} style={{ padding: '0', background: 'transparent' }}>

        {/* Modern Controls Panel - Dashboard Style */}
        <section className={dashboardStyles.panel} style={{ marginBottom: '25px' }}>
          <div className={dashboardStyles.panelHead}>
            <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '600', color: '#2c3e50' }}>
              <FontAwesomeIcon icon={faFilter} style={{ marginRight: '10px', color: '#3498db' }} />
              Task Controls
            </h2>
            <Link to="/new-task-collaborative-documentation">
              <button className={dashboardStyles.qaBtn} style={{ margin: '0' }}>
                <FontAwesomeIcon icon={faPlus} /> New Task
              </button>
            </Link>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '20px',
            padding: '20px'
          }}>
            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Filter:</span>
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  style={{
                    padding: '8px 16px',
                    border: filter === option.value ? '2px solid #3498db' : '1px solid #ddd',
                    borderRadius: '20px',
                    background: filter === option.value ? '#3498db' : 'white',
                    color: filter === option.value ? 'white' : '#666',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${viewMode === 'grid' ? '#3498db' : '#ddd'}`,
                    borderRadius: '6px',
                    background: viewMode === 'grid' ? '#3498db' : 'white',
                    color: viewMode === 'grid' ? 'white' : '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.2s ease'
                  }}
                  title="Grid View"
                >
                  <FontAwesomeIcon icon={faThLarge} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${viewMode === 'list' ? '#3498db' : '#ddd'}`,
                    borderRadius: '6px',
                    background: viewMode === 'list' ? '#3498db' : 'white',
                    color: viewMode === 'list' ? 'white' : '#666',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.2s ease'
                  }}
                  title="List View"
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faSort} style={{ color: '#666' }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: 'white',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="status">Sort by Status</option>
                  <option value="assignee">Sort by Assignee</option>
                  <option value="title">Sort by Title</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modern Task List - Dashboard Style */}
      <div className={dashboardStyles.main} style={{ padding: '0', background: 'transparent' }}>
        <section className={dashboardStyles.panel}>
          <div className={dashboardStyles.panelHead}>
            <h2 style={{ margin: '0', fontSize: '20px', fontWeight: '600', color: '#2c3e50' }}>
              <FontAwesomeIcon icon={faTasks} style={{ marginRight: '10px', color: '#3498db' }} />
              Task List ({sortedTasks.length})
            </h2>
          </div>
          
          <div style={{ padding: '20px' }}>
            {sortedTasks.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#95a5a6',
                fontSize: '16px'
              }}>
                <FontAwesomeIcon icon={faTasks} style={{ fontSize: '48px', marginBottom: '20px', opacity: '0.3' }} />
                <p>No tasks found matching your criteria.</p>
                <Link to="/new-task-collaborative-documentation">
                  <button className={dashboardStyles.qaBtn} style={{ marginTop: '15px' }}>
                    <FontAwesomeIcon icon={faPlus} /> Create Your First Task
                  </button>
                </Link>
              </div>
            ) : viewMode === 'grid' ? (
              <div className={dashboardStyles.tasksGrid}>
                {sortedTasks.map(task => (
                  <div key={task.id} className={dashboardStyles.taskCard}>
                    <div className={dashboardStyles.taskCardHeader}>
                      <h3 className={dashboardStyles.taskCardTitle}>
                        {task.title}
                      </h3>
                      <span className={`${dashboardStyles.taskCardStatus} ${dashboardStyles[task.status]}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className={dashboardStyles.taskCardMeta}>
                      <div className={dashboardStyles.taskCardMetaItem}>
                        <FontAwesomeIcon icon={faUser} />
                        <span>{task.assignee}</span>
                      </div>
                      <div className={dashboardStyles.taskCardMetaItem}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>Due: {task.dueDate}</span>
                      </div>
                      <div className={dashboardStyles.taskCardMetaItem}>
                        <span className={`${dashboardStyles.taskCardPriority} ${dashboardStyles[task.priority]}`}>
                          {task.priority} priority
                        </span>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className={dashboardStyles.taskCardDescription}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className={dashboardStyles.taskCardActions}>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          style={{
                            padding: '4px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#3498db',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Edit Task"
                        >
                          <FontAwesomeIcon icon={faEdit} size="xs" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(task.id)}
                          style={{
                            padding: '4px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#e74c3c',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Delete Task"
                        >
                          <FontAwesomeIcon icon={faTrash} size="xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={dashboardStyles.recentTasksList}>
                {sortedTasks.map(task => (
                <div key={task.id} className={dashboardStyles.taskItem} style={{ 
                  borderLeft: `4px solid ${
                    task.priority === 'high' ? '#e74c3c' : 
                    task.priority === 'medium' ? '#f39c12' : '#3498db'
                  }`
                }}>
                  <div className={dashboardStyles.taskInfo}>
                    <h4 className={dashboardStyles.taskTitle} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <span style={{ fontSize: '18px' }}>
                        {getStatusIcon(task.status)}
                      </span>
                      {task.title}
                    </h4>
                    <div className={dashboardStyles.taskMeta} style={{ marginBottom: '10px' }}>
                      <span className={`${dashboardStyles.taskStatus} ${dashboardStyles[task.status]}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                      <span className={`${dashboardStyles.taskPriority} ${dashboardStyles[task.priority]}`}>
                        {getPriorityIcon(task.priority)} {task.priority} priority
                      </span>
                      <span className={dashboardStyles.taskDue}>
                        <FontAwesomeIcon icon={faUser} style={{ marginRight: '5px' }} />
                        {task.assignee}
                      </span>
                      <span className={dashboardStyles.taskDue}>
                        <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '5px' }} />
                        Due: {task.dueDate}
                      </span>
                    </div>
                    {task.description && (
                      <p style={{ 
                        margin: '0', 
                        fontSize: '13px', 
                        color: '#666', 
                        lineHeight: '1.4'
                      }}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    alignItems: 'center'
                  }}>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      style={{
                        padding: '5px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: 'white'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        style={{
                          padding: '5px 8px',
                          border: 'none',
                          borderRadius: '4px',
                          background: '#3498db',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Edit Task"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(task.id)}
                        style={{
                          padding: '5px 8px',
                          border: 'none',
                          borderRadius: '4px',
                          background: '#e74c3c',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Delete Task"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Alert variant="danger" className={styles.mb4}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Are you sure you want to delete this task?</span>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => handleDeleteTask(showDeleteConfirm)}
              >
                Delete
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Alert>
      )}


    </Layout>
  );
};

export default TaskCardCollabDoc;
