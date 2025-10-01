import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faUser, faSignOutAlt, faProjectDiagram,
  faChevronLeft, faChevronRight, faCalendar, faTasks,
  faPlus, faTrash
} from '@fortawesome/free-solid-svg-icons';
import NewProjectModal from './NewProjectModal';
import DeleteProjectModal from './DeleteProjectModal';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [projects, setProjects] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState('');
  const [calendarKey, setCalendarKey] = useState(0);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

      const dashboardResponse = await axios.get(`${API_BASE_URL}/api/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEmail(dashboardResponse.data.email);
      setUsername(dashboardResponse.data.username);
      setProjects(dashboardResponse.data.projects || []);

      const calendarResponse = await axios.get(`${API_BASE_URL}/api/calendar/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCalendarEvents(calendarResponse.data.events || []);

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
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    setSelectedDate(null);
    setCalendarKey(prevKey => prevKey + 1);
  }, [currentDate]);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate("/");
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const daysArray = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const today = new Date().toISOString().split('T')[0];

      const dayProjects = calendarEvents.filter(e => e.type === 'project' && e.start === dateStr);
      const dayTasks = calendarEvents.filter(e => e.type === 'task' && e.start === dateStr);

      daysArray.push({
        day,
        dateStr,
        projects: dayProjects,
        tasks: dayTasks,
        isToday: dateStr === today,
        isOverdue: dateStr < today && (dayProjects.length > 0 || dayTasks.length > 0),
        hasFuture: dateStr > today && (dayProjects.length > 0 || dayTasks.length > 0),
        totalItems: dayProjects.length + dayTasks.length
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

  const handleOpenDashboard = (project) => {
    const { project_id, project_name, role } = project;
    let dashboardPath;
    switch (role.toLowerCase()) {
      case 'group leader':
        dashboardPath = '/groupleaderdashboard';
        break;
      case 'supervisor':
        dashboardPath = '/supervisordashboard';
        break;
      default:
        dashboardPath = '/studentdashboard';
        break;
    }
    navigate(dashboardPath, {
      state: { projectId: project_id, projectName: project_name },
    });
  };

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>{username.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}</div>
          <div className={styles.brandText}>
            <h2 className={styles.brandTextH2}>{username}</h2>
            <small className={styles.brandTextSmall}>{email}</small>
          </div>
        </div>

        <nav className={styles.nav}>
          <button className={styles.navBtn} onClick={() => navigate('/mytasks', { state: { email } })}><FontAwesomeIcon icon={faCheckCircle} /> My Tasks</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faUser} /> Profile</button>
          <button className={styles.navBtn} onClick={logout}><FontAwesomeIcon icon={faSignOutAlt} /> Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Projects Table */}
        <section className={styles.panel}>
          <div className={styles.panelHead} style={{ justifyContent: 'center' }}>
            <h2 className={styles.panelHeadH2}>Projects Overview</h2>
          </div>
          <button className={styles.addBtn} onClick={() => setShowNewProjectModal(true)}><FontAwesomeIcon icon={faPlus} /> Create New Project</button>
          {showNewProjectModal && (
            <NewProjectModal
              onClose={() => setShowNewProjectModal(false)}
              onSuccess={() => {
                fetchDashboardData(); // Refresh projects list
                setShowNewProjectModal(false); // Close modal
              }}
            />
          )}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Progress</th>
                <th>Due Date</th>
                <th>Action</th>
                <th>Role</th>
                <th>Project Grade</th>
                <th>Remove Project</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={index}>
                  <td className={styles.wrappableCell}>{project.project_name}</td> {/* Apply to Name cell */}
                  <td>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{ width: `${project.progress || 0}%` }}
                      />
                      <span className={styles.progressText}>{project.progress || 0}%</span>
                    </div>
                  </td>
                  <td className={styles.wrappableCell}>{project.dueDate}</td> {/* If dates can be long */}
                  <td>
                    <button className={styles.openBtn} onClick={() => handleOpenDashboard(project)}>
                      Open
                    </button>
                  </td>
                  <td className={styles.wrappableCell}>{project.role}</td> {/* Apply to Role if needed */}
                  <td className={styles.wrappableCell}>{project.grade || '-'}</td>
                  <td>
                    {project.role === "Supervisor" && (
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowDeleteModal(true);
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px' }}
                        title="Delete Project"
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          style={{ color: 'red', fontSize: '16px' }}
                        />
                      </button>
                    )}
                  </td>
                  {showDeleteModal && selectedProject && (
                    <DeleteProjectModal
                      project={selectedProject}
                      onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedProject(null);
                      }}
                      onSuccess={() => {
                        fetchDashboardData(); // Refresh projects list
                      }}
                    />
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Calendar and Selected Date Items */}
        <section className={styles.charts}>
          <div className={styles.chartCard} key={`calendar-${calendarKey}`}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelHeadH3}>Calendar</h3>
            </div>
            <div className={styles.panelHead}>
              <button className={styles.calendarNavBtn} onClick={prevMonth}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <h4 className={styles.calendarHeader}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h4>
              <button className={styles.calendarNavBtn} onClick={nextMonth}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>

            <div className={styles.calendarGrid}>
              {days.map(day => (
                <div key={day} className={styles.calendarDayHeader}>
                  {day}
                </div>
              ))}

              {getDaysInMonth().map((dayData, index) => {
                const isEmpty = !dayData;
                const isToday = dayData?.isToday;
                const isOverdue = dayData?.isOverdue;
                const hasFuture = dayData?.hasFuture;
                const totalItems = dayData?.totalItems || 0;

                const getBaseClass = () => {
                  if (isEmpty) return styles.calendarCellEmpty;
                  if (isToday) return styles.calendarCellToday;
                  if (isOverdue) return styles.calendarCellOverdue;
                  if (hasFuture) return styles.calendarCellFuture;
                  return styles.calendarCell;
                };

                const getHoverClass = () => {
                  if (isToday) return styles.calendarCellTodayHover;
                  if (isOverdue) return styles.calendarCellOverdueHover;
                  if (hasFuture) return styles.calendarCellFutureHover;
                  return styles.calendarCellHover;
                };

                return (
                  <div
                    key={`${dayData?.dateStr}-${index}-${calendarKey}`}
                    className={`${getBaseClass()} ${isEmpty ? '' : styles.hoverTarget}`}
                    onClick={() => dayData && setSelectedDate(dayData.dateStr)}
                    onMouseEnter={(e) => {
                      if (!isEmpty) {
                        e.currentTarget.classList.add(getHoverClass());
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isEmpty) {
                        e.currentTarget.classList.remove(getHoverClass());
                      }
                    }}
                  >
                    {dayData && (
                      <>
                        <div className={styles.panelHead}>
                          <span className={styles.calendarCellDay}>{dayData.day}</span>
                          {totalItems > 0 && (
                            <span className={`${styles.calendarCellCount} ${isToday ? styles.calendarCellCountToday : ''}`}>
                              {totalItems}
                            </span>
                          )}
                        </div>

                        {dayData.projects.length > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                            {dayData.projects.slice(0, 3).map((project, projIndex) => (
                              <div
                                key={projIndex}
                                className={`${styles.calendarCellProject} ${isToday ? styles.calendarCellProjectToday : ''}`}
                                title={`Project: ${project.name}`}
                              />
                            ))}
                            {dayData.projects.length > 3 && (
                              <span className={`${styles.calendarCellExtra} ${isToday ? styles.calendarCellExtraToday : ''}`}>
                                +{dayData.projects.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {dayData.tasks.length > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                            {dayData.tasks.slice(0, 3).map((task, taskIndex) => (
                              <div
                                key={taskIndex}
                                className={`${styles.calendarCellEvent} ${isToday ? styles.calendarCellEventToday : ''}`}
                                title={`Task: ${task.name}${task.project ? ` (Project: ${task.project.name})` : ''}`}
                              />
                            ))}
                            {dayData.tasks.length > 3 && (
                              <span className={`${styles.calendarCellExtra} ${isToday ? styles.calendarCellExtraToday : ''}`}>
                                +{dayData.tasks.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.calendarLegend}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div className={styles.calendarLegendItem}>
                  <div className={styles.calendarLegendProject}></div>
                  <span>Project</span>
                </div>
                <div className={styles.calendarLegendItem}>
                  <div className={styles.calendarLegendEvent}></div>
                  <span>Task</span>
                </div>
                <div className={styles.calendarLegendItem}>
                  <div className={styles.calendarLegendToday}></div>
                  <span>Today</span>
                </div>
                <div className={styles.calendarLegendItem}>
                  <div className={styles.calendarLegendOverdue}></div>
                  <span>Overdue</span>
                </div>
                <div className={styles.calendarLegendItem}>
                  <div className={styles.calendarLegendFuture}></div>
                  <span>Future</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelHeadH3}>Items Due on Selected Date</h3>
            </div>
            <div className={styles.calendarLegend}>
              {selectedDate ? (
                <div>
                  <div className={styles.selectedDateContainer}>
                    {formatDateForDisplay(selectedDate)}
                  </div>

                  {calendarEvents.filter(e => e.type === 'project' && e.start === selectedDate).length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 className={styles.selectedDateProjectsHeader}>
                        📁 Projects ({calendarEvents.filter(e => e.type === 'project' && e.start === selectedDate).length})
                      </h4>
                      <ul className={styles.selectedDateList}>
                        {calendarEvents.filter(e => e.type === 'project' && e.start === selectedDate).map((project, index) => (
                          <li
                            key={`proj-${index}`}
                            className={`${styles.selectedDateListItem} ${index % 2 === 0 ? '' : styles.selectedDateListItemAlt}`}
                          >
                            <div className={styles.selectedDateItemTitle}>
                              <FontAwesomeIcon icon={faProjectDiagram} style={{ color: '#228693' }} />
                              {project.name}
                            </div>
                            <div className={styles.selectedDateItemMeta}>
                              <span>Role: <span className={project.role.toLowerCase() === 'supervisor' ? styles.selectedDateItemRoleSupervisor : styles.selectedDateItemRoleOther}>{project.role}</span></span>
                              {project.description && (
                                <span className={styles.selectedDateItemDescription}>
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

                  {calendarEvents.filter(e => e.type === 'task' && e.start === selectedDate).length > 0 && (
                    <div>
                      <h4 className={styles.selectedDateEventsHeader}>
                        🗓️ Tasks ({calendarEvents.filter(e => e.type === 'task' && e.start === selectedDate).length})
                      </h4>
                      <ul className={styles.selectedDateList}>
                        {calendarEvents.filter(e => e.type === 'task' && e.start === selectedDate).map((task, index) => (
                          <li
                            key={`task-${index}`}
                            className={`${styles.selectedDateListItem} ${index % 2 === 0 ? '' : styles.selectedDateListItemAlt}`}
                          >
                            <div className={styles.selectedDateItemTitle}>
                              <FontAwesomeIcon icon={faTasks} style={{ color: '#228693' }} />
                              {task.name}
                            </div>
                            <div className={styles.selectedDateItemMeta}>
                              <span>Project: <span className={styles.selectedDateItemProgress}>{task.project ? task.project.name : 'No associated project'}</span></span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(calendarEvents.filter(e => e.start === selectedDate).length === 0) && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateTitle}>🎉 Great work!</div>
                      <div className={styles.emptyStateMessage}>
                        No projects or tasks scheduled for {formatDateForDisplay(selectedDate)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateTitle}>📅 Select a date</div>
                  <div className={styles.emptyStateInstructions}>
                    Click on any date in the calendar to view projects and tasks scheduled for that day
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        <footer className={styles.footer}>
          © {new Date().getFullYear()} Project Collaboration Portal
        </footer>
      </main>

      {/* Right Sidebar */}
      <aside className={styles.rightbar}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelHeadH3}>Upcoming Deadlines</h3>
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
            <h3 className={styles.panelHeadH3}>Recent Events</h3>
          </div>
          <ul className={styles.list}>
            {calendarEvents.slice(-3).reverse().map((event, index) => (
              <li key={index}>
                <FontAwesomeIcon icon={event.type === 'project' ? faProjectDiagram : faTasks} style={{ color: '#228693' }} />
                {event.name}
                {event.type === 'task' && event.project ? ` (Project: ${event.project.name})` : ''}
              </li>
            ))}
            {calendarEvents.length === 0 && (
              <li style={{ color: '#666', fontStyle: 'italic' }}>No recent events</li>
            )}
          </ul>
        </section>
      </aside>
    </div>
  );
};

export default Dashboard;