import React from 'react';
import styles from '../../styles/common.module.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return styles.btnPrimary;
      case 'secondary': return styles.btnSecondary;
      case 'success': return styles.btnSuccess;
      case 'danger': return styles.btnDanger;
      case 'warning': return styles.btnWarning;
      case 'outline': return styles.btnOutline;
      default: return styles.btnPrimary;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return styles.btnSm;
      case 'lg': return styles.btnLg;
      default: return '';
    }
  };

  const buttonClasses = [
    styles.btn,
    getVariantClass(),
    getSizeClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;