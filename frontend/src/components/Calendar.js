import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    const API_BASE_URL = window.location.hostname === 'localhost'
      ? 'http://127.0.0.1:8000'
      : 'https://pcp-backend-f4a2.onrender.com';

    axios.get(`${API_BASE_URL}/api/calendar/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setEvents(response.data.events || []);
        setCurrentTime(response.data.current_time || 'N/A');
      })
      .catch(err => {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/');
        } else {
          setError('Failed to fetch calendar data');
          console.error('Error:', err);
        }
      });
  }, [navigate]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Calendar Data Test</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Current Server Time: {currentTime}</p>
      <h2>Events:</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            {event.title} - {event.start}
          </li>
        ))}
      </ul>
      {events.length === 0 && <p>No events found.</p>}
    </div>
  );
};

export default Calendar;