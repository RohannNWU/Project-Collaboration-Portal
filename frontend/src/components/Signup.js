import React, { useState } from 'react';
import axios from 'axios';
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
      const response = await axios.post(
        `${API_BASE_URL}/api/adduser/`,
        {
          email: email,
          fname: fname,
          lname: lname,
          password: password
        },
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data.error || 'Failed to add user');
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'white',
          marginBottom: '1.5rem',
          textAlign: 'center',
          contentEditable: false,
          tabIndex: "-1"
        }}
      >
        Sign Up for the<br />Project Collaboration Portal
      </h2>
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
        type="text"
        value={lname}
        onChange={(e) => setLname(e.target.value)}
        placeholder="Last Name"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleAddUser}>Add User</button>
      <button onClick={() => navigate('/')}>Back to Login</button>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default AddUser;