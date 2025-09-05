import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import styles from './login.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faArrowRight } from '@fortawesome/free-solid-svg-icons';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend.azurewebsites.net';

      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST', // Changed to POST
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for HttpOnly tokens
        body: JSON.stringify({ email, password }), // Send email and password
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        setError('Server returned invalid response');
        setLoading(false);
        return;
      }

      if (data.success) {
        const userData = { username: data.username, role: data.role };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProtectedData = async () => {
    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend.azurewebsites.net';

      const response = await fetch(`${API_BASE_URL}/protected/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
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
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loadingSpinner}>Signing in...</span>
              ) : (
                <span>Sign in <FontAwesomeIcon icon={faArrowRight} /></span>
              )}
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
                onClick={() => navigate('/signup')}
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