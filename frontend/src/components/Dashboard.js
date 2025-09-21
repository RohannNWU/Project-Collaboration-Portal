// Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder, faCheckCircle, faUsers, faCodeBranch, faFile, faInbox,
  faBell, faCog, faSignOutAlt, faPlus, faSearch, faEnvelope, faProjectDiagram,
  faComment, faUpload, faChevronLeft, faChevronRight, faCalendar
} from '@fortawesome/free-solid-svg-icons';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [projects, setProjects] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fixed: Combined fetch function with proper dependency management
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

      // Fetch dashboard data
      const dashboardResponse = await axios.get(`${API_BASE_URL}/api/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmail(dashboardResponse.data.email);
      setUsername(dashboardResponse.data.username);
      setProjects(dashboardResponse.data.projects || []);

      // Fetch calendar events
      const calendarResponse = await axios.get(`${API_BASE_URL}/api/calendar/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCalendarEvents(calendarResponse.data.events || []);
      setCurrentTime(calendarResponse.data.current_time || 'N/A');
      
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch dashboard data');
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/');
      }
    }
  }, [navigate]); // Fixed: Only navigate is the dependency

  // Fixed: Empty dependency array since fetchDashboardData has its own dependencies
  useEffect(() => {
    fetchDashboardData();
  }, []); // Empty array since fetchDashboardData uses useCallback

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate("/");
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const daysArray = [];
    
    // Empty cells for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null);
    }
    
    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const today = new Date().toISOString().split('T')[0];
      
      // Get projects due on this date
      const dayProjects = projects.filter(p => p.dueDate === dateStr);
      
      // Get calendar events for this date
      const dayEvents = calendarEvents.filter(event => {
        if (event.start) {
          const eventDate = event.start.split('T')[0];
          return eventDate === dateStr;
        }
        return false;
      });
      
      daysArray.push({
        day,
        dateStr,
        projects: dayProjects,
        events: dayEvents,
        isToday: dateStr === today,
        isOverdue: dateStr < today && (dayProjects.length > 0 || dayEvents.length > 0),
        hasFuture: dateStr > today && (dayProjects.length > 0 || dayEvents.length > 0),
        totalItems: dayProjects.length + dayEvents.length
      });
    }
    
    return daysArray;
  };

  const formatDateForDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>{username.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}</div>
          <div className={styles.brandText}>
            <h2>{username}</h2>
            <small>{email}</small>
          </div>
        </div>

        <nav className={styles.nav}>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faFolder} /> My Projects</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faCheckCircle} /> My Tasks</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faUsers} /> Teams</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faCodeBranch} /> Repos</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faFile} /> Documents</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faInbox} /> Inbox</button>
        </nav>

        <div className={styles.quickActions}>
          <button className={styles.qaBtn}><FontAwesomeIcon icon={faPlus} /> New Project</button>
          <button className={styles.qaBtn}><FontAwesomeIcon icon={faPlus} /> New Task</button>
          <button className={styles.qaBtn}><FontAwesomeIcon icon={faComment} /> Message Team</button>
          <button className={styles.qaBtn}><FontAwesomeIcon icon={faUpload} /> Upload File</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.tbLeft}>
            <h1>Project Collaboration Portal</h1>
            <span className={styles.badge}>Student</span>
          </div>
          <div className={styles.tbRight}>
            <div className={styles.search}>
              <input type="text" placeholder="Search projects, tasks, people…" />
              <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            </div>
            <button className={styles.iconBtn} title="Notifications">
              <FontAwesomeIcon icon={faBell} />
            </button>
            <button className={styles.iconBtn} title="Settings">
              <FontAwesomeIcon icon={faCog} />
            </button>
            <div className={styles.user}>
              <button className={styles.logoutBtn} onClick={logout} title="Logout">
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          </div>
        </header>

        {/* KPIs */}
        <section className={styles.cards}>
          <div className={styles.card}>
            <p>Active Projects</p>
            <h2 id="kpi-projects">{projects.length}</h2>
          </div>
          <div className={styles.card}>
            <p>Calendar Events</p>
            <h2 id="kpi-events">{calendarEvents.length}</h2>
          </div>
          <div className={styles.card}>
            <p>Total Deadlines</p>
            <h2 id="kpi-deadlines">{projects.length + calendarEvents.length}</h2>
          </div>
        </section>

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Projects Table */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Projects Overview</h2>
          </div>
          <button className={styles.addBtn} onClick={() => navigate('/newproject')}>+ Add Project</button>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Progress</th>
                <th>Due Date</th>
                <th>Action</th>
                <th>Supervisor</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={index}>
                  <td>{project.project_name}</td>
                  <td>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td>{project.dueDate}</td>
                  <td>
                    <button className={styles.editBtn} onClick={() => navigate('/editproject', { state: { projectName: project.project_name } })}>Edit</button>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={project.role.toLowerCase() === 'supervisor'}
                      readOnly
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Calendar and Selected Date Items */}
        <section className={styles.charts}>
          {/* Calendar */}
          <div className={styles.chartCard}>
            <div className={styles.panelHead}>
              <h3>Calendar</h3>
              {currentTime && (
                <small style={{ color: '#666', marginLeft: '10px' }}>Server Time: {currentTime}</small>
              )}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '1px solid #eee'
            }}>
              <button 
                onClick={prevMonth} 
                style={{
                  background: '#6a11cb',
                  color: 'white',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#5a0eb8';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#6a11cb';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <h4 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h4>
              <button 
                onClick={nextMonth} 
                style={{
                  background: '#6a11cb',
                  color: 'white',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#5a0eb8';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#6a11cb';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '1px',
              background: '#e0e0e0',
              borderRadius: '8px',
              overflow: 'hidden',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {/* Day Headers */}
              {days.map(day => (
                <div 
                  key={day} 
                  style={{
                    background: '#6a11cb',
                    color: 'white',
                    padding: '8px',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '12px',
                    minHeight: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {getDaysInMonth().map((dayData, index) => {
                const isEmpty = !dayData;
                const isToday = dayData?.isToday;
                const isOverdue = dayData?.isOverdue;
                const hasFuture = dayData?.hasFuture;
                const totalItems = dayData?.totalItems || 0;
                
                return (
                  <div 
                    key={index} 
                    style={{
                      background: isEmpty ? '#f8f8f8' : 
                                 isToday ? '#6a11cb' : 
                                 isOverdue ? '#ffeaea' : 
                                 hasFuture ? '#e8f5e8' : 'white',
                      minHeight: '70px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      borderLeft: isOverdue ? '4px solid #e74c3c' : 
                                  hasFuture ? '4px solid #27ae60' : 'none',
                      cursor: isEmpty ? 'default' : 'pointer',
                      color: isToday ? 'white' : 'black',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      boxShadow: isToday ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                    }}
                    onClick={() => dayData && setSelectedDate(dayData.dateStr)}
                    onMouseEnter={(e) => {
                      if (!isEmpty) {
                        e.target.style.background = isToday ? '#5a0eb8' : 
                                                    isOverdue ? '#f8d7d7' : 
                                                    hasFuture ? '#d4f1d4' : '#f5f5f5';
                        e.target.style.transform = 'scale(1.02)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isEmpty) {
                        e.target.style.background = isToday ? '#6a11cb' : 
                                                    isOverdue ? '#ffeaea' : 
                                                    hasFuture ? '#e8f5e8' : 'white';
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = isToday ? '0 2px 4px rgba(0,0,0,0.1)' : 'none';
                      }
                    }}
                  >
                    {dayData && (
                      <>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '4px'
                        }}>
                          <span style={{ 
                            fontSize: '14px', 
                            fontWeight: '600' 
                          }}>
                            {dayData.day}
                          </span>
                          {totalItems > 0 && (
                            <span style={{
                              fontSize: '10px',
                              background: isToday ? 'rgba(255,255,255,0.2)' : '#6a11cb',
                              color: isToday ? 'white' : '#fff',
                              padding: '2px 6px',
                              borderRadius: '10px',
                              fontWeight: 'bold'
                            }}>
                              {totalItems}
                            </span>
                          )}
                        </div>
                        
                        {/* Project Indicators */}
                        {dayData.projects.length > 0 && (
                          <div style={{ 
                            marginBottom: '2px',
                            display: 'flex', 
                            gap: '2px', 
                            justifyContent: 'flex-start',
                            flexWrap: 'wrap'
                          }}>
                            {dayData.projects.slice(0, 3).map((project, projIndex) => (
                              <div 
                                key={projIndex} 
                                style={{
                                  width: '4px',
                                  height: '4px',
                                  background: isToday ? 'rgba(255,255,255,0.8)' : '#6a11cb',
                                  borderRadius: '50%',
                                  cursor: 'help'
                                }} 
                                title={`Project: ${project.project_name}`}
                              />
                            ))}
                            {dayData.projects.length > 3 && (
                              <span style={{
                                fontSize: '9px',
                                color: isToday ? 'rgba(255,255,255,0.8)' : '#666',
                                fontWeight: 'bold'
                              }}>+{dayData.projects.length - 3}</span>
                            )}
                          </div>
                        )}
                        
                        {/* Event Indicators */}
                        {dayData.events.length > 0 && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '2px', 
                            justifyContent: 'flex-start',
                            flexWrap: 'wrap'
                          }}>
                            {dayData.events.slice(0, 3).map((event, eventIndex) => (
                              <div 
                                key={eventIndex} 
                                style={{
                                  width: '6px',
                                  height: '2px',
                                  background: isToday ? 'rgba(255,255,255,0.8)' : '#28a745',
                                  borderRadius: '1px',
                                  cursor: 'help'
                                }} 
                                title={`Event: ${event.title}`}
                              />
                            ))}
                            {dayData.events.length > 3 && (
                              <span style={{
                                fontSize: '9px',
                                color: isToday ? 'rgba(255,255,255,0.8)' : '#666',
                                fontWeight: 'bold'
                              }}>+{dayData.events.length - 3}</span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div style={{ 
              marginTop: '10px', 
              padding: '8px', 
              background: '#f8f9fa', 
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '4px', height: '4px', background: '#6a11cb', borderRadius: '50%' }}></div>
                  <span>Project</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '2px', background: '#28a745', borderRadius: '1px' }}></div>
                  <span>Event</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '4px', height: '4px', background: '#6a11cb', borderRadius: '50%', opacity: '0.5' }}></div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Due on Selected Date */}
          <div className={styles.chartCard}>
            <div className={styles.panelHead}>
              <h3>Items Due on Selected Date</h3>
            </div>
            <div style={{ 
              padding: '15px', 
              background: '#f8f9fa', 
              borderRadius: '6px', 
              border: '1px solid #e9ecef',
              minHeight: '300px'
            }}>
              {selectedDate ? (
                <div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#333', 
                    marginBottom: '15px',
                    textAlign: 'center',
                    padding: '8px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6'
                  }}>
                    {formatDateForDisplay(selectedDate)}
                  </div>
                  
                  {/* Projects for selected date */}
                  {projects.filter(p => p.dueDate === selectedDate).length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ 
                        color: '#6a11cb', 
                        margin: '0 0 10px 0',
                        fontSize: '14px',
                        borderBottom: '2px solid #6a11cb',
                        paddingBottom: '5px',
                        display: 'inline-block'
                      }}>
                        📁 Projects ({projects.filter(p => p.dueDate === selectedDate).length})
                      </h4>
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        maxHeight: '150px', 
                        overflowY: 'auto',
                        margin: 0
                      }}>
                        {projects.filter(p => p.dueDate === selectedDate).map((project, index) => (
                          <li 
                            key={`proj-${index}`} 
                            style={{ 
                              padding: '12px',
                              borderBottom: '1px solid #eee',
                              background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                              borderRadius: '6px',
                              marginBottom: '8px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = index % 2 === 0 ? '#f8f9fa' : '#fff';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#f8f9fa';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#333', 
                              marginBottom: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <FontAwesomeIcon icon={faProjectDiagram} style={{ color: '#6a11cb' }} />
                              {project.project_name}
                            </div>
                            <div style={{ 
                              display: 'flex', 
                              gap: '15px', 
                              fontSize: '12px', 
                              color: '#666',
                              flexWrap: 'wrap'
                            }}>
                              <span>Progress: <span style={{ color: '#28a745', fontWeight: '600' }}>{project.progress}%</span></span>
                              <span>Role: <span style={{ 
                                color: project.role.toLowerCase() === 'supervisor' ? '#dc3545' : '#17a2b8',
                                fontWeight: '600'
                              }}>{project.role}</span></span>
                              {project.description && (
                                <span style={{ maxWidth: '200px' }}>
                                  {project.description.length > 50 
                                    ? `${project.description.substring(0, 50)}...` 
                                    : project.description
                                  }
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Events for selected date */}
                  {calendarEvents.filter(event => {
                    if (event.start) {
                      const eventDate = event.start.split('T')[0];
                      return eventDate === selectedDate;
                    }
                    return false;
                  }).length > 0 && (
                    <div>
                      <h4 style={{ 
                        color: '#28a745', 
                        margin: '0 0 10px 0',
                        fontSize: '14px',
                        borderBottom: '2px solid #28a745',
                        paddingBottom: '5px',
                        display: 'inline-block'
                      }}>
                        🗓️ Events ({calendarEvents.filter(event => {
                          if (event.start) {
                            const eventDate = event.start.split('T')[0];
                            return eventDate === selectedDate;
                          }
                          return false;
                        }).length})
                      </h4>
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        maxHeight: '150px', 
                        overflowY: 'auto',
                        margin: 0
                      }}>
                        {calendarEvents.filter(event => {
                          if (event.start) {
                            const eventDate = event.start.split('T')[0];
                            return eventDate === selectedDate;
                          }
                          return false;
                        }).map((event, index) => (
                          <li 
                            key={`event-${index}`} 
                            style={{ 
                              padding: '12px',
                              borderBottom: '1px solid #eee',
                              background: index % 2 === 0 ? '#fff' : '#f8f9fa',
                              borderRadius: '6px',
                              marginBottom: '8px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = index % 2 === 0 ? '#f8f9fa' : '#fff';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = index % 2 === 0 ? '#fff' : '#f8f9fa';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#333', 
                              marginBottom: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <FontAwesomeIcon icon={faCalendar} style={{ color: '#28a745' }} />
                              {event.title}
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#666',
                              display: 'flex',
                              gap: '15px',
                              flexWrap: 'wrap'
                            }}>
                              <span style={{ minWidth: '120px' }}>
                                {event.start ? new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'All day'}
                              </span>
                              {event.description && (
                                <span style={{ maxWidth: '200px' }}>
                                  {event.description.length > 50 
                                    ? `${event.description.substring(0, 50)}...` 
                                    : event.description
                                  }
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {(projects.filter(p => p.dueDate === selectedDate).length === 0 && 
                   calendarEvents.filter(event => {
                     if (event.start) {
                       const eventDate = event.start.split('T')[0];
                       return eventDate === selectedDate;
                     }
                     return false;
                   }).length === 0) && (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#666', 
                      padding: '40px 10px',
                      fontStyle: 'italic'
                    }}>
                      <div style={{ marginBottom: '10px', fontSize: '16px' }}>
                        🎉 Great work!
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        No projects or events scheduled for {formatDateForDisplay(selectedDate)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  padding: '40px 10px',
                  fontStyle: 'italic'
                }}>
                  <div style={{ marginBottom: '15px', fontSize: '18px' }}>
                    📅 Select a date
                  </div>
                  <div style={{ 
                    marginBottom: '20px', 
                    fontSize: '14px',
                    opacity: 0.8
                  }}>
                    Click on any date in the calendar to view projects and events scheduled for that day
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    justifyContent: 'center', 
                    flexWrap: 'wrap',
                    fontSize: '12px',
                    maxWidth: '300px',
                    margin: '0 auto'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '12px', height: '12px', background: '#6a11cb', borderRadius: '50%' }}></div>
                      <span>Project due date</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '8px', height: '3px', background: '#28a745', borderRadius: '1px' }}></div>
                      <span>Calendar event</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className={styles.rightbar}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Upcoming Deadlines</h3>
            <button className={styles.iconBtn}><FontAwesomeIcon icon={faCalendar} /></button>
          </div>
          <ul className={styles.list}>
            {projects.slice(0, 5).map((project, index) => (
              <li key={index}>
                <FontAwesomeIcon icon={faProjectDiagram} /> {project.project_name} - {project.dueDate}
              </li>
            ))}
            {projects.length === 0 && (
              <li style={{ color: '#666', fontStyle: 'italic' }}>No upcoming deadlines</li>
            )}
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Recent Events</h3>
            <span className={styles.live}>Live</span>
          </div>
          <ul className={styles.list}>
            {calendarEvents.slice(-3).reverse().map((event, index) => (
              <li key={index}>
                <FontAwesomeIcon icon={faCalendar} style={{ color: '#28a745' }} /> {event.title}
              </li>
            ))}
            {calendarEvents.length === 0 && (
              <li style={{ color: '#666', fontStyle: 'italic' }}>No recent events</li>
            )}
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Inbox</h3>
            <button className={styles.iconBtn}><FontAwesomeIcon icon={faInbox} /></button>
          </div>
          <ul className={styles.list}>
            <li><FontAwesomeIcon icon={faEnvelope} /> Dr. Smith - Project feedback</li>
            <li><FontAwesomeIcon icon={faEnvelope} /> Team - Meeting reminder</li>
            <li><FontAwesomeIcon icon={faEnvelope} /> System - Weekly digest</li>
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}><h3>Getting Started</h3></div>
          <ul className={styles.bullet}>
            <li>Connect your Git repository</li>
            <li>Invite teammates to your workspace</li>
            <li>Create your first sprint board</li>
            <li>Enable calendar sync</li>
          </ul>
        </section>

        <footer className={styles.footer}>
          © {new Date().getFullYear()} Project Collaboration Portal · Student Dashboard
        </footer>
      </aside>
    </div>
  );
};

export default Dashboard;