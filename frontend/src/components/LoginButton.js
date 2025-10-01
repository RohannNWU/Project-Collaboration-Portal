import React, { useRef, useEffect } from 'react';
import './LoginButton.css';

const LoginButton = ({ children }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;

    const handleMouseMove = (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percent = (x / width) * 100;

      // Apply linear gradient on mouse move
      button.style.setProperty(
        'background',
        `linear-gradient(90deg, #228693 ${percent - 50}%, #83C8D1 ${percent}%, #228693 ${percent + 50}%)`
      );
    };

    const handleMouseLeave = () => {
      // Revert to solid color on mouse leave
      button.style.setProperty('background', '#228693');
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <button className="loginButton" ref={buttonRef} type="submit">
      {children}
    </button>
  );
};

export default LoginButton;