import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser, faLock, faArrowLeft, faArrowRight, faUsers, faRocket, faChalkboardTeacher, faChartLine } from '@fortawesome/free-solid-svg-icons';
import styles from './Signup.module.css';

const AddUser = () => {
  const [email, setEmail] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddUser = async () => {
    setIsLoading(true);
    setMessage('');
    
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
      
      // Clear form on success
      if (response.data.message.includes('successfully')) {
        setEmail('');
        setFname('');
        setLname('');
        setPassword('');
      }
    } catch (error) {
      setMessage(error.response?.data.error || 'Failed to add user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddUser();
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.signupContainer}>
        {/* Left Side - Branding */}
        <div className={styles.brandSection}>
          <div className={styles.brandContent}>
            <div className={styles.logo}>
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <h1>Join Our Community</h1>
            <p>Start your collaborative journey with PCP</p>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faRocket} />
                </span>
                <span>Instant project setup</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faChalkboardTeacher} />
                </span>
                <span>Supervisor guidance</span>
              </div>
              <div className={styles.featureItem}>
                <span className={styles.featureIcon}>
                  <FontAwesomeIcon icon={faChartLine} />
                </span>
                <span>Progress tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className={styles.formSection}>
          <div className={styles.formContent}>
            <div className={styles.header}>
              <h2>Create Account</h2>
              <p>Join the Project Collaboration Portal</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.signupForm}>
              <div className={styles.nameRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="fname" className={styles.inputLabel}>First Name</label>
                  <div className={styles.inputContainer}>
                    <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                    <input
                      type="text"
                      id="fname"
                      value={fname}
                      onChange={(e) => setFname(e.target.value)}
                      placeholder="First name"
                      required
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="lname" className={styles.inputLabel}>Last Name</label>
                  <div className={styles.inputContainer}>
                    <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                    <input
                      type="text"
                      id="lname"
                      value={lname}
                      onChange={(e) => setLname(e.target.value)}
                      placeholder="Last name"
                      required
                      className={styles.inputField}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.inputLabel}>Email Address</label>
                <div className={styles.inputContainer}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.inputLabel}>Password</label>
                <div className={styles.inputContainer}>
                  <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className={styles.inputField}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`${styles.signupButton} ${isLoading ? styles.loading : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <>
                    Create Account
                    <FontAwesomeIcon icon={faArrowRight} className={styles.buttonIcon} />
                  </>
                )}
              </button>
            </form>

            {message && (
              <div className={`${styles.message} ${message.includes('successfully') ? styles.success : styles.error}`}>
                {message}
              </div>
            )}

            <div className={styles.divider}>
              <span>Already have an account?</span>
            </div>

            <div className={styles.loginSection}>
              <button
                type="button"
                className={styles.loginButton}
                onClick={() => navigate('/')}
              >
                <FontAwesomeIcon icon={faArrowLeft} className={styles.buttonIcon} />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;