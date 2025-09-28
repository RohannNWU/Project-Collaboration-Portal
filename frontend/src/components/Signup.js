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
      <h2 className={styles.signupTitle}>
        Sign Up for the<br />Project Collaboration Portal
      </h2>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address"
        className={styles.signupInput}
      />
      <input
        type="text"
        value={fname}
        onChange={(e) => setFname(e.target.value)}
        placeholder="First Name"
        className={styles.signupInput}
      />
      <input
        type="text"
        value={lname}
        onChange={(e) => setLname(e.target.value)}
        placeholder="Last Name"
        className={styles.signupInput}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className={styles.signupInput}
      />
      <button onClick={handleAddUser} className={styles.signupButton}>
        Add User
      </button>
      <button onClick={() => navigate('/')} className={styles.backToLoginButton}>
        Back to Login
      </button>
      {message && <p className={styles.signupMessage}>{message}</p>}
    </div>
  );
};

export default AddUser;