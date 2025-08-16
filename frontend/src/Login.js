import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('https://pcp-backend.azurewebsites.net/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Expected JSON, but received: ${text.substring(0, 100)}...`);
      }

      if (response.ok) {
        // Store the JWT token and navigate
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setMessage(data.message || 'An error occurred on the server.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`Login failed: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </form>
  );
}

export default Login;