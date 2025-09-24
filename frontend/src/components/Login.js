import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.css';
import { faEnvelope, faLock, faEye, faEyeSlash, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';
        
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Login response data:', data);
        
        // Store tokens with debugging
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Verify tokens were stored
        console.log('Stored access_token:', localStorage.getItem('access_token'));
        console.log('Stored refresh_token:', localStorage.getItem('refresh_token'));
        console.log('Stored user:', localStorage.getItem('user'));
        
        // Small delay to ensure storage is complete
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      setError('Invalid credentials');
    }
  };
  
  const goToAddUser = () => {
    navigate('/adduser');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginContent}>
          <div className={styles.branding}>
            <h1>Project Collaboration Portal</h1>
            <p>Your collaborative workspace</p>
          </div>

          <div className={styles.welcome}>
            <h2>Welcome back</h2>
            <p>Sign in to your collaboration workspace</p>
          </div>

          <form id="loginForm" className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email address</label>
              <div className={styles.passwordInputContainer}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordInputContainer}>
                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  id="togglePassword"
                  className={styles.togglePassword}
                  aria-label="Toggle password visibility"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input type="checkbox" id="rememberMe" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className={styles.forgotPassword}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={styles.loginButton}
              id="loginButton"
            >
              <span>Sign in <FontAwesomeIcon icon={faArrowRight} /></span>
            </button>
          </form>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <div className={styles.signupLink}>
            <p>
              Don't have an account?
              <button
                type="button"
                className={styles.signupButton}
                onClick={goToAddUser}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>

      {error && <div id="toast" className={styles.toast}>{error}</div>}
    </div>
  );
}

export default Login;