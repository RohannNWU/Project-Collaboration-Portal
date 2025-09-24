import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './layout/Layout';
import Card from './common/Card';
import Button from './common/Button';
import Alert from './common/Alert';
import { useApp } from '../context/AppContext';
import styles from '../styles/common.module.css';

const NewTaskCollabDoc = () => {
  const navigate = useNavigate();
  const { addTask, teamMembers } = useApp();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    dueDate: '',
    category: 'general'
  });

  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!taskData.title.trim()) newErrors.title = 'Title is required';
    if (!taskData.assignee) newErrors.assignee = 'Assignee is required';
    if (taskData.title.length > 100) newErrors.title = 'Title must be less than 100 characters';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setSubmitStatus('Please fix the errors below.');
      return;
    }

    addTask(taskData);
    setSubmitStatus('Task created successfully!');
    
    // Reset form
    setTaskData({
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      dueDate: '',
      category: 'general'
    });
    setErrors({});
    
    // Navigate to tasks page after a short delay
    setTimeout(() => {
      navigate('/task-card-collaborative-documentation');
    }, 1500);
  };

  const categories = [
    { value: 'general', label: 'General', icon: '📋' },
    { value: 'documentation', label: 'Documentation', icon: '📄' },
    { value: 'development', label: 'Development', icon: '💻' },
    { value: 'testing', label: 'Testing', icon: '🧪' },
    { value: 'design', label: 'Design', icon: '🎨' },
    { value: 'research', label: 'Research', icon: '🔍' }
  ];

  return (
    <Layout 
      title="Create New Task" 
      subtitle="Add a new task to your project collaboration workflow"
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Status Messages */}
        {submitStatus && (
          <Alert 
            variant={submitStatus.includes('successfully') ? 'success' : 'danger'}
            onClose={() => setSubmitStatus('')}
            className={styles.mb4}
          >
            {submitStatus}
          </Alert>
        )}

        <Card title="Task Details" subtitle="Fill in the information below to create a new task">
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={taskData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive task title"
                className={`${styles.formInput} ${errors.title ? 'error' : ''}`}
                style={{ borderColor: errors.title ? 'var(--color-danger)' : undefined }}
              />
              {errors.title && <div className={styles.formError}>{errors.title}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Description
              </label>
              <textarea
                name="description"
                value={taskData.description}
                onChange={handleInputChange}
                placeholder="Provide detailed information about the task"
                rows="4"
                className={styles.formTextarea}
              />
              <div className={styles.formHelp}>Optional: Add more context about what needs to be done</div>
            </div>

            <div className={`${styles.grid} ${styles.gridCols2}`}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Assignee *
                </label>
                <select
                  name="assignee"
                  value={taskData.assignee}
                  onChange={handleInputChange}
                  className={`${styles.formSelect} ${errors.assignee ? 'error' : ''}`}
                  style={{ borderColor: errors.assignee ? 'var(--color-danger)' : undefined }}
                >
                  <option value="">Select team member</option>
                  {teamMembers.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
                {errors.assignee && <div className={styles.formError}>{errors.assignee}</div>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Priority
                </label>
                <select
                  name="priority"
                  value={taskData.priority}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="low">🌱 Low Priority</option>
                  <option value="medium">⚡ Medium Priority</option>
                  <option value="high">🔥 High Priority</option>
                </select>
              </div>
            </div>

            <div className={`${styles.grid} ${styles.gridCols2}`}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={taskData.dueDate}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  min={new Date().toISOString().split('T')[0]}
                />
                <div className={styles.formHelp}>Optional: Set a deadline for this task</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Category
                </label>
                <select
                  name="category"
                  value={taskData.category}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setTaskData({
                    title: '',
                    description: '',
                    assignee: '',
                    priority: 'medium',
                    dueDate: '',
                    category: 'general'
                  });
                  setSubmitStatus('');
                  setErrors({});
                }}
              >
                🔄 Reset Form
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
              >
                ✅ Create Task
              </Button>
            </div>

          </form>
        </Card>

        {/* Task Creation Tips */}
        <Card title="💡 Task Creation Tips" className={styles.mt4}>
          <div className={`${styles.grid} ${styles.gridCols2}`} style={{ gap: 'var(--spacing-xl)' }}>
            <div>
              <h4 style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-sm)' }}>✅ Best Practices</h4>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Use clear and descriptive task titles</li>
                <li>Provide detailed descriptions for complex tasks</li>
                <li>Set appropriate priority levels based on urgency</li>
                <li>Choose realistic due dates</li>
                <li>Assign tasks to team members with relevant skills</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--color-info)', marginBottom: 'var(--spacing-sm)' }}>📋 Task Categories</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                {categories.map(cat => (
                  <div key={cat.value} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <span>{cat.icon}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default NewTaskCollabDoc;
