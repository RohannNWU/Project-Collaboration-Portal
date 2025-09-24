import React from 'react';
import { Link } from 'react-router-dom';
import Layout from './layout/Layout';
import Card from './common/Card';
import Button from './common/Button';
import Badge from './common/Badge';
import { useApp } from '../context/AppContext';
import styles from '../styles/common.module.css';

const DashboardCollabDoc = () => {
  const { documents, tasks, computed } = useApp();

  const recentDocuments = documents.slice(-5).reverse();
  const recentTasks = tasks.slice(-3).reverse();

  const quickActions = [
    {
      title: 'Upload File',
      description: 'Upload a new document to collaborate with your team',
      path: '/upload-collaborative-documentation',
      icon: '📁',
      variant: 'primary'
    },
    {
      title: 'Create Task',
      description: 'Add a new task and assign it to team members',
      path: '/new-task-collaborative-documentation',
      icon: '➕',
      variant: 'success'
    },
    {
      title: 'View All Tasks',
      description: 'Manage and track all project tasks',
      path: '/task-card-collaborative-documentation',
      icon: '📋',
      variant: 'warning'
    },
    {
      title: 'Style Guide',
      description: 'Check the design system and style guidelines',
      path: '/style-collaborative-documentation',
      icon: '🎨',
      variant: 'info'
    }
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout 
      title="Collaborative Documentation Dashboard" 
      subtitle="Overview of your team's documents, tasks, and activities"
    >
      {/* Quick Actions */}
      <div className={styles.mb5}>
        <h2 className={styles.mb3}>Quick Actions</h2>
        <div className={`${styles.grid} ${styles.gridCols4}`}>
          {quickActions.map((action) => (
            <Card
              key={action.path}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: 'var(--font-size-lg)' }}>{action.icon}</span>
                  {action.title}
                </div>
              }
              actions={
                <Link to={action.path}>
                  <Button variant={action.variant} size="sm">
                    {action.title}
                  </Button>
                </Link>
              }
            >
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
                {action.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className={`${styles.grid} ${styles.gridCols3}`}>
        {/* Recent Documents */}
        <Card 
          title="📄 Recent Documents" 
          subtitle={`${documents.length} total documents`}
          actions={
            <Link to="/upload-collaborative-documentation">
              <Button variant="primary" size="sm">
                📁 Upload File
              </Button>
            </Link>
          }
        >
          {recentDocuments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-sm)' }}>📂</div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>No documents uploaded yet</p>
              <Link to="/upload-collaborative-documentation">
                <Button variant="outline" size="sm" className={styles.mt2}>
                  Upload your first document
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {recentDocuments.map((doc, index) => (
                <div 
                  key={doc.id || index}
                  style={{ 
                    padding: 'var(--spacing-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--border-radius-md)',
                    border: 'var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>
                        📄 {doc.name}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                        {formatFileSize(doc.size)} • {formatDate(doc.uploadDate)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Active Tasks */}
        <Card 
          title="✅ Active Tasks" 
          subtitle={`${computed.taskStats.total} total tasks`}
          actions={
            <Link to="/task-card-collaborative-documentation">
              <Button variant="warning" size="sm">
                📋 View All
              </Button>
            </Link>
          }
        >
          {recentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-sm)' }}>📝</div>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>No tasks created yet</p>
              <Link to="/new-task-collaborative-documentation">
                <Button variant="outline" size="sm" className={styles.mt2}>
                  Create your first task
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {recentTasks.map((task) => (
                <div 
                  key={task.id}
                  style={{ 
                    padding: 'var(--spacing-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--border-radius-md)',
                    border: 'var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-xs)' }}>
                    <div style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', flex: 1 }}>
                      {task.title}
                    </div>
                    <Badge variant={getStatusVariant(task.status)} style={{ fontSize: 'var(--font-size-xs)' }}>
                      {task.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                    Assigned to: {task.assignee} • Priority: {task.priority}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Team Activity */}
        <Card title="👥 Team Activity" subtitle="Recent collaboration activities">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {documents.length > 0 && (
              <div style={{ 
                padding: 'var(--spacing-sm)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius-md)',
                border: 'var(--border)'
              }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  📄 Document uploaded
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  {documents[documents.length - 1]?.uploadedBy} uploaded "{documents[documents.length - 1]?.name}"
                </div>
              </div>
            )}
            
            {tasks.length > 0 && (
              <div style={{ 
                padding: 'var(--spacing-sm)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius-md)',
                border: 'var(--border)'
              }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                  ✅ Task updated
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  {tasks[tasks.length - 1]?.assignee} is working on "{tasks[tasks.length - 1]?.title}"
                </div>
              </div>
            )}

            <div style={{ 
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--border-radius-md)',
              border: 'var(--border)'
            }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                🚀 Dashboard accessed
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                You viewed the collaborative documentation dashboard
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Project Statistics */}
      <Card title="📊 Project Statistics" className={styles.mt5}>
        <div className={`${styles.grid} ${styles.gridCols4}`}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
              {documents.length}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Documents Uploaded
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
              {computed.taskStats.completed}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Tasks Completed
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning)' }}>
              {computed.taskStats.inProgress}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Tasks In Progress
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-info)' }}>
              {computed.teamMembers?.length || 5}
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Team Members
            </div>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default DashboardCollabDoc;
