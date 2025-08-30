import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

function Login() {
  const [username, setUsername] = useState(''); // Fixed: Added setUsername
  const [password, setPassword] = useState(''); // Fixed: Added setPassword
  const [error, setError] = useState(''); // Fixed: Added error state
  const [loading, setLoading] = useState(false); // Fixed: Added loading state
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
    <div className="login-page"> {/* Changed from body to div */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"/>
      <div className="login-container">
        <div className="login-content">
          <div className="branding">
            <div className="logo">
              <i className="fas fa-users"></i>
            </div>
            <h1>CollabPortal</h1>
            <p>Your collaborative workspace</p>
          </div>

          <div className="welcome">
            <h2>Welcome back</h2>
            <p>Sign in to your collaboration workspace</p>
          </div>

          <form id="loginForm" className="login-form" onSubmit={handleSubmit}> {/* Fixed: Moved onSubmit to form */}
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-with-icon">
                <i className="fas fa-envelope"></i>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Enter your email" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)} // Added: Input binding
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <i className="fas fa-lock input-icon"></i>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="Enter your password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Added: Input binding
                />
                <button type="button" id="togglePassword" className="toggle-password" aria-label="Toggle password visibility">
                  <i className="far fa-eye"></i>
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" id="rememberMe"/>
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-password" 
                onClick={() => navigate('/forgot-password')} // Fixed: Changed to button
              >
                Forgot password?
              </button>
            </div>

            <button 
              type="submit" 
              className="login-button" 
              id="loginButton" 
              disabled={loading} // Added: Disable when loading
            >
              {loading ? (
                <span className="loading-spinner">Signing in...</span>
              ) : (
                <span>Sign in <i className="fas fa-arrow-right"></i></span>
              )}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="signup-link">
            <p>Don't have an account? <button 
              type="button" 
              className="signup-button" 
              onClick={() => navigate('/signup')} // Fixed: Changed to button
            >
              Sign up
            </button></p>
          </div>
        </div>
      </div>

      {error && <div id="toast" className="toast">{error}</div>} {/* Added: Error display */}
    </div>
  );
}

export default Login;