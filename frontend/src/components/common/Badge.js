import React from 'react';
import styles from '../../styles/common.module.css';

const Badge = ({ 
  children, 
  variant = 'secondary', 
  className = '',
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'success': return styles.badgeSuccess;
      case 'danger': return styles.badgeDanger;
      case 'warning': return styles.badgeWarning;
      case 'info': return styles.badgeInfo;
      case 'secondary': return styles.badgeSecondary;
      default: return styles.badgeSecondary;
    }
  };

  const badgeClasses = [
    styles.badge,
    getVariantClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;
