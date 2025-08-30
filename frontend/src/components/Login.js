import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:5280" : "https://pcp-backend.azurewebsites.net";

      const response = await fetch(`${API_BASE_URL}/api/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
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
        localStorage.setItem('user', JSON.stringify({ username: data.username, role: data.role }));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"/>
      <link rel="stylesheet" href="styles.css"/>
      <body class="login-page">
        <div class="login-container">
          <div class="login-content">
            <div class="branding">
              <div class="logo">
                <i class="fas fa-users"></i>
              </div>
              <h1>CollabPortal</h1>
              <p>Your collaborative workspace</p>
            </div>

            <div class="welcome">
              <h2>Welcome back</h2>
              <p>Sign in to your collaboration workspace</p>
            </div>

            <form id="loginForm" class="login-form">
              <div class="form-group">
                <label for="email">Email address</label>
                <div class="input-with-icon">
                  <i class="fas fa-envelope"></i>
                  <input type="email" id="email" placeholder="Enter your email" required/>
                </div>
              </div>

              <div class="form-group">
                <label for="password">Password</label>
                <div class="password-input-container">
                  <i class="fas fa-lock input-icon"></i>
                  <input type="password" id="password" placeholder="Enter your password" required/>
                    <button type="button" id="togglePassword" class="toggle-password" aria-label="Toggle password visibility">
                      <i class="far fa-eye"></i>
                    </button>
                </div>
              </div>

              <div class="form-options">
                <label class="remember-me">
                  <input type="checkbox" id="rememberMe"/>
                    <span>Remember me</span>
                </label>
                <a href="#" class="forgot-password">Forgot password?</a>
              </div>

              <button type="submit" class="login-button" id="loginButton">
                <span>Sign in <i class="fas fa-arrow-right"></i></span>
                <span class="loading-spinner" style="display: none;">Signing in...</span>
              </button>
            </form>

            <div class="divider">
              <span>OR</span>
            </div>

            <div class="signup-link">
              <p>Don't have an account? <a href="#">Sign up</a></p>
            </div>
          </div>
        </div>

        <div id="toast" class="toast"></div>

        <script src="scripts.js"></script>
      </body>
    </>
  );
}

export default Login;
