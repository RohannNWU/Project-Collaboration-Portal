import React from 'react';
import styles from '../../styles/common.module.css';

const Loading = ({ 
  message = 'Loading...', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const spinnerStyle = {
    width: size === 'sm' ? '24px' : size === 'lg' ? '56px' : '40px',
    height: size === 'sm' ? '24px' : size === 'lg' ? '56px' : '40px',
  };

  return (
    <div className={`${styles.loading} ${className}`} {...props}>
      <div style={{ textAlign: 'center' }}>
        <div className={styles.spinner} style={spinnerStyle}></div>
        {message && (
          <p style={{ 
            marginTop: 'var(--spacing-md)', 
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;