import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Signup.module.css';

const AddUser = () => {
  const [email, setEmail] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAddUser = async () => {
    try {
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/adduser/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          fname: fname,
          lname: lname,
          password: password
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }
    } catch (error) {
      setMessage(error.message || 'Failed to add user');
    }
  };

  return (
    <div>
      <div className={styles.signupContainer}>
        <h2>Add New User</h2>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
        />
        <input
          type="text"
          value={fname}
          onChange={(e) => setFname(e.target.value)}
          placeholder="First Name"
        />
        <input
          type='text'
          value={lname}
          onChange={(e) => setLname(e.target.value)}
          placeholder='Last Name'
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
      </div>
      <div>
        <button onClick={handleAddUser}>Add User</button>
        <button onClick={() => navigate('/')}>Back to Login</button>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default AddUser;