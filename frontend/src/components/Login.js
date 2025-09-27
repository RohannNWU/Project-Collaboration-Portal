import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './login.module.css';
import { faEnvelope, faLock, faEye, faEyeSlash, faArrowRight, faUsers, faComments, faChartLine, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../context/AuthProvider';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const { setUser } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';
        
      const response = await axios.post(`${API_BASE_URL}/api/login/`, { email, password });
      
      // Store tokens and user data
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('email', response.data.email);
      
      // Update auth context
      setUser({
        username: response.data.username,
        email: response.data.email,
        token: response.data.access
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
      // Clear any partial login state
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
      localStorage.removeItem('email');
      setUser(null);
    } finally {
      setIsLoading(false);
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
        {/* Left Side - Branding */}
        <div className={styles.brandSection}>
          <div className={styles.brandContent}>
            <div className={styles.logo}>
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <h1>Project Collaboration Portal</h1>
            <p>Connect • Collaborate • Create</p>
            <div className={styles.brandSection}>
  <div className={styles.brandContent}>
    <div className={styles.logo}>
      <FontAwesomeIcon icon={faUsers} />
    </div>
    <h1>Project Collaboration Portal</h1>
    <p>Connect • Collaborate • Create</p>
    <div className={styles.featureList}>
      <div className={styles.featureItem}>
            <span className={styles.featureIcon}>
              <FontAwesomeIcon icon={faComments} />
            </span>
            <span>Real-time team messaging</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>
              <FontAwesomeIcon icon={faChartLine} />
            </span>
            <span>Project progress tracking</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>
              <FontAwesomeIcon icon={faChalkboardTeacher} />
            </span>
            <span>Supervisor collaboration</span>
          </div>
    </div>
  </div>
</div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className={styles.formSection}>
          <div className={styles.formContent}>
            <div className={styles.welcome}>
              <h2>Welcome back!</h2>
              <p>Sign in to continue your collaboration journey</p>
            </div>

            <form id="loginForm" className={styles.loginForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.inputLabel}>Email address</label>
                <div className={styles.inputContainer}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.inputLabel}>Password</label>
                <div className={styles.inputContainer}>
                  <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={togglePasswordVisibility}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className={styles.formOptions}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" id="rememberMe" />
                  <span className={styles.checkboxLabel}>Remember me</span>
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
                className={`${styles.loginButton} ${isLoading ? styles.loading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <>
                    Sign in 
                    <FontAwesomeIcon icon={faArrowRight} className={styles.buttonIcon} />
                  </>
                )}
              </button>
            </form>

            <div className={styles.divider}>
              <span>New to PCP?</span>
            </div>

            <div className={styles.signupSection}>
              <button
                type="button"
                className={styles.signupButton}
                onClick={goToAddUser}
              >
                Create your account
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.toast}>
          <div className={styles.toastContent}>
            <span className={styles.toastMessage}>{error}</span>
            <button onClick={() => setError('')} className={styles.toastClose}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;