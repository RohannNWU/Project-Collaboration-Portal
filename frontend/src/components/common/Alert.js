import React from 'react';
import styles from '../../styles/common.module.css';

const Alert = ({ 
  children, 
  variant = 'info', 
  className = '',
  onClose,
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'success': return styles.alertSuccess;
      case 'danger': return styles.alertDanger;
      case 'warning': return styles.alertWarning;
      case 'info': return styles.alertInfo;
      default: return styles.alertInfo;
    }
  };

  const alertClasses = [
    styles.alert,
    getVariantClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={alertClasses} {...props}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {children}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 'var(--font-size-lg)',
              cursor: 'pointer',
              padding: '0',
              marginLeft: 'var(--spacing-sm)',
              color: 'inherit'
            }}
            aria-label="Close alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
