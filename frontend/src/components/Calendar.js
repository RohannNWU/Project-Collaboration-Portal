import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBell, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from './Calendar.module.css';

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjectsFromBackend();
  }, [navigate]);

  const fetchProjectsFromBackend = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      const response = await axios.get(`${API_BASE_URL}/api/calendar/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform the API response to match our expected format
      const transformedProjects = (response.data.events || []).map(event => ({
        id: event.id || Math.random(), // Use event.id if available, otherwise generate
        title: event.title || event.name || 'Untitled Event',
        date: event.start ? new Date(event.start).toISOString().split('T')[0] : null
      })).filter(project => project.date); // Filter out events without valid dates

      setProjects(transformedProjects);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/');
      } else {
        setError('Failed to fetch calendar data');
        console.error('Error fetching projects:', err);
        // Set empty array as fallback so UI doesn't break
        setProjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => navigate('/dashboard');

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayProjects = projects.filter(p => p.date === dateStr);
      const today = new Date().toISOString().split('T')[0];
      
      days.push({
        day,
        dateStr,
        projects: dayProjects,
        isToday: dateStr === today,
        isOverdue: dayProjects.some(p => new Date(p.date) < new Date(today)),
        hasFuture: dayProjects.some(p => new Date(p.date) > new Date(today))
      });
    }
    
    return days;
  };

  const getNotifications = () => {
    const today = new Date();
    return projects.map(project => {
      const projectDate = new Date(project.date);
      const diffDays = Math.ceil((projectDate - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return { ...project, type: 'today', message: `${project.title} is due today!` };
      if (diffDays < 0) return { ...project, type: 'overdue', message: `${project.title} is overdue by ${Math.abs(diffDays)} days` };
      if (diffDays <= 7) return { ...project, type: 'upcoming', message: `${project.title} is due in ${diffDays} days` };
      return { ...project, type: 'future', message: `${project.title} is scheduled for ${project.date}` };
    });
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Show loading state
  if (loading) {
    return (
      <div className={styles.calendarPage}>
        <div className={styles.calendarSection}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading calendar data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.calendarPage}>
        <div className={styles.calendarSection}>
          <div className={styles.errorContainer}>
            <h2>Unable to load calendar</h2>
            <p>{error}</p>
            <button onClick={fetchProjectsFromBackend} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calendarPage}>
      {/* Calendar Section */}
      <div className={styles.calendarSection}>
        <div className={styles.calendarHeader}>
          <button onClick={prevMonth} className={styles.navBtn}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h1>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h1>
          <button onClick={nextMonth} className={styles.navBtn}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className={styles.calendar}>
          {/* Day headers */}
          <div className={styles.dayHeaders}>
            {days.map(day => (
              <div key={day} className={styles.dayHeader}>{day}</div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className={styles.calendarGrid}>
            {getDaysInMonth().map((dayData, index) => (
              <div key={index} className={`${styles.calendarDay} ${!dayData ? styles.empty : ''} ${dayData?.isToday ? styles.today : ''} ${dayData?.isOverdue ? styles.overdue : ''} ${dayData?.hasFuture ? styles.future : ''}`}>
                {dayData && (
                  <>
                    <span className={styles.dayNumber}>{dayData.day}</span>
                    {dayData.projects.length > 0 && (
                      <div className={styles.projectDots}>
                        {dayData.projects.map(project => (
                          <div key={project.id} className={styles.projectDot} title={project.title}></div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className={styles.notificationsSection}>
        <div className={styles.sectionHeader}>
          <FontAwesomeIcon icon={faBell} />
          <h2>Project Notifications</h2>
        </div>
        <div className={styles.notificationsList}>
          {projects.length === 0 ? (
            <div className={styles.emptyState}>
              No upcoming projects found. 
              <button onClick={fetchProjectsFromBackend} className={styles.refreshButton}>
                Refresh
              </button>
            </div>
          ) : (
            getNotifications().map(notification => (
              <div key={notification.id} className={`${styles.notification} ${styles[notification.type]}`}>
                <span>{notification.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Home Button */}
      <button className={styles.homeButton} onClick={goHome}>
        <FontAwesomeIcon icon={faHome} />
      </button>
    </div>
  );
};

export default Calendar;