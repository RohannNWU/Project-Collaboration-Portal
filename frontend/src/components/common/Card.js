import React from 'react';
import styles from '../../styles/common.module.css';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  actions,
  className = '',
  ...props 
}) => {
  const cardClasses = [styles.card, className].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {(title || subtitle) && (
        <div className={styles.cardHeader}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
        </div>
      )}
      
      <div className={styles.cardContent}>
        {children}
      </div>
      
      {actions && (
        <div className={styles.cardActions}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default Card;
