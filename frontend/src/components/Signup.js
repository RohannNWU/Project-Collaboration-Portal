import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { faEnvelope, faLock, faEye, faEyeSlash, faUser, faUserSecret } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LoginButton from './LoginButton';

const AddUser = () => {
  const [email, setEmail] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [secQuestion, setSecQuestion] = useState('');
  const [secAnswer, setSecAnswer] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          password: password,
          security_question: secQuestion,
          security_answer: secAnswer
        },
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data.error || 'Failed to add user');
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
            <h1>Sign up for the<br />Project Collaboration Portal</h1>
          </div>

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email address</label>
              <div className={styles.passwordInputContainer}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fname">First name</label>
              <div className={styles.passwordInputContainer}>
                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                <input
                  type="text"
                  id="fname"
                  placeholder="Enter your first name"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lname">Last name</label>
              <div className={styles.passwordInputContainer}>
                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                <input
                  type="text"
                  id="lname"
                  placeholder="Enter your last name"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="securityquestion">Security Questions</label>
              <div className={styles.passwordInputContainer}>
                <FontAwesomeIcon icon={faUserSecret} className={styles.inputIcon} />
                <select
                  id="secQuestion"
                  onChange={(e) => setSecQuestion(e.target.value)}
                >
                  <option value="">Select ONE security question</option>
                  <option value="What is your favourite car model?">1. What is your favorite car model?</option>
                  <option value="Where is your favourite holiday destination?">2. Where is your favourite holiday destination?</option>
                  <option value="What is your favourite snack?">3. What is your favourite snack?</option>
                  <option value="Who is your favourite superhero?">4. Who is your favourite superhero?</option>
                  <option value="What is your favourite name for a pet?">5. What is your favourite name for a pet?</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="secAnswer">Security Question Answer</label>
              <div className={styles.passwordInputContainer}>
                <FontAwesomeIcon icon={faUserSecret} className={styles.inputIcon} />
                <input
                  type="text"
                  id="secAnswer"
                  placeholder="Enter your security answer"
                  value={secAnswer}
                  onChange={(e) => setSecAnswer(e.target.value)}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  aria-label="Toggle password visibility"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <LoginButton>Sign Up</LoginButton>
          </form>

          <div className={styles.signupLink}>
            <p>
              Already have an account?
              <button
                type="button"
                className={styles.signupButton}
                onClick={() => navigate('/')}
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>

      {message && <div id="toast" className={styles.toast}>{message}</div>}
    </div>
  );
};

export default AddUser;