import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from './layout/Layout';
import Card from './common/Card';
import Button from './common/Button';
import Badge from './common/Badge';
import Alert from './common/Alert';
import { useApp } from '../context/AppContext';
import styles from '../styles/common.module.css';

const TaskCardCollabDoc = () => {
  const { tasks, updateTask, deleteTask, computed } = useApp();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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
      {/* Task Statistics */}
      <div className={`${styles.grid} ${styles.gridCols4} ${styles.mb4}`}>
        <Card title="Total Tasks" className={styles.textCenter}>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
            📊 {computed.taskStats.total}
          </div>
        </Card>
        <Card title="Completed" className={styles.textCenter}>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
            ✅ {computed.taskStats.completed}
          </div>
        </Card>
        <Card title="In Progress" className={styles.textCenter}>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning)' }}>
            🔄 {computed.taskStats.inProgress}
          </div>
        </Card>
        <Card title="Pending" className={styles.textCenter}>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
            📋 {computed.taskStats.pending}
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className={styles.mb4}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/new-task-collaborative-documentation">
              <Button variant="primary">
                ➕ Add New Task
              </Button>
            </Link>
            
            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
              {filterOptions.map(option => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(option.value)}
                >
                  {option.label} ({option.count})
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.formSelect}
              style={{ minWidth: '120px' }}
            >
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="assignee">Assignee</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </Card>

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

      {/* Task Cards */}
      {sortedTasks.length === 0 ? (
        <Card className={styles.textCenter}>
          <div style={{ padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 'var(--font-size-display)', marginBottom: 'var(--spacing-md)' }}>
              📝
            </div>
            <h3>No tasks found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't created any tasks yet." 
                : `No ${filter} tasks found.`
              }
            </p>
            <Link to="/new-task-collaborative-documentation">
              <Button variant="primary">Create Your First Task</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className={`${styles.grid} ${styles.gridAutoFit}`}>
          {sortedTasks.map(task => (
            <Card
              key={task.id}
              title={
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <span style={{ flex: 1 }}>{task.title}</span>
                  <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginLeft: 'var(--spacing-sm)' }}>
                    {getPriorityIcon(task.priority)}
                    {getStatusIcon(task.status)}
                  </div>
                </div>
              }
              actions={
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={styles.formSelect}
                    style={{ fontSize: 'var(--font-size-xs)', padding: 'var(--spacing-xs)' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => setShowDeleteConfirm(task.id)}
                  >
                    🗑️
                  </Button>
                </div>
              }
            >
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                  <Badge variant={getStatusVariant(task.status)}>
                    {task.status.replace('-', ' ')}
                  </Badge>
                  <Badge variant={getPriorityVariant(task.priority)}>
                    {task.priority} priority
                  </Badge>
                </div>
                
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                    <strong>Assignee:</strong> {task.assignee}
                  </div>
                  {task.category && (
                    <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                      <strong>Category:</strong> {task.category}
                    </div>
                  )}
                  {task.dueDate && (
                    <div>
                      <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default TaskCardCollabDoc;
