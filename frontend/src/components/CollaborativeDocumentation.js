import React from 'react';
import { Link } from 'react-router-dom';
import Layout from './layout/Layout';
import Card from './common/Card';
import Button from './common/Button';
import { useApp } from '../context/AppContext';
import styles from '../styles/common.module.css';

const CollaborativeDocumentation = () => {
  const { computed } = useApp();

  const features = [
    {
      title: 'Upload Documents',
      description: 'Upload and organize documents for team collaboration.',
      path: '/upload-collaborative-documentation',
      icon: '📄',
      variant: 'success'
    },
    {
      title: 'Task Management',
      description: 'Create, assign, and track tasks with your team.',
      path: '/task-card-collaborative-documentation',
      icon: '✅',
      variant: 'warning'
    }
  ];

  return (
    <Layout 
      title="Collaborative Documentation Portal" 
      subtitle="Welcome to your team's project collaboration hub"
    >
      {/* Quick Stats */}
      <div className={`${styles.grid} ${styles.gridCols4} ${styles.mb5}`}>
        <Card title="Total Tasks" className={styles.textCenter}>
          <div style={{ fontSize: 'var(--font-size-xxxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
            {computed.taskStats.total}
          </div>
        </Card>
        <Card title="Completed" className={styles.textCenter}>
          <div style={{ fontSize: 'var(--font-size-xxxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
            {computed.taskStats.completed}
          </div>
        </Card>
        <Card title="In Progress" className={styles.textCenter}>
          <div style={{ fontSize: 'var(--font-size-xxxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning)' }}>
            {computed.taskStats.inProgress}
          </div>
        </Card>
        <Card title="Pending" className={styles.textCenter}>
          <div style={{ fontSize: 'var(--font-size-xxxl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-secondary)' }}>
            {computed.taskStats.pending}
          </div>
        </Card>
      </div>

      {/* Features Grid */}
      <div className={styles.mb5}>
        <h2 className={styles.mb3}>Available Features</h2>
        <div className={`${styles.grid} ${styles.gridAutoFit}`}>
          {features.map((feature) => (
            <Card
              key={feature.path}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <span style={{ fontSize: 'var(--font-size-xl)' }}>{feature.icon}</span>
                  {feature.title}
                </div>
              }
              actions={
                <Link to={feature.path}>
                  <Button variant={feature.variant} size="sm">
                    Open {feature.title}
                  </Button>
                </Link>
              }
            >
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* About Section */}
      <Card 
        title="About This Portal"
        subtitle="Collaborative documentation system for efficient teamwork"
      >
        <div className={`${styles.grid} ${styles.gridCols2}`} style={{ gap: 'var(--spacing-xl)' }}>
          <div>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-sm)' }}>
              🚀 Key Benefits
            </h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
              <li>Real-time collaboration on documents</li>
              <li>Streamlined task management</li>
              <li>Centralized project resources</li>
              <li>Team activity tracking</li>
              <li>Consistent design standards</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-sm)' }}>
              🛠️ Built With
            </h4>
            <ul style={{ color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
              <li>React.js for dynamic user interfaces</li>
              <li>React Router for seamless navigation</li>
              <li>Context API for state management</li>
              <li>CSS Modules for consistent styling</li>
              <li>Local storage for data persistence</li>
            </ul>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default CollaborativeDocumentation;
