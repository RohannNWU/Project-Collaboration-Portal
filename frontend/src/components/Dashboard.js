import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faSignOutAlt,
  faProjectDiagram,
  faChevronLeft,
  faChevronRight,
  faCalendar,
  faTasks,
  faPlus,
  faTrash,
  faBell,
} from '@fortawesome/free-solid-svg-icons';
import NewProjectModal from './NewProjectModal';
import DeleteProjectModal from './DeleteProjectModal';
import ProfileModal from './ProfileModal';
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigate = useNavigate();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/');
        return;
      }

      const API_BASE_URL =
        window.location.hostname === 'localhost'
          ? 'http://127.0.0.1:8000'
          : 'https://pcp-backend-f4a2.onrender.com';

      const dashboardResponse = await axios.get(`${API_BASE_URL}/api/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmail(dashboardResponse.data.email);
      setUsername(dashboardResponse.data.username);
      setProjects(dashboardResponse.data.projects || []);

      const calendarResponse = await axios.get(`${API_BASE_URL}/api/calendar/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const meetingsResponse = await axios.get(`${API_BASE_URL}/api/getusermeetings/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const meetingsEvents = meetingsResponse.data.meetings.map((meeting) => ({
        type: 'meeting',
        start: meeting.date_time.split(' ')[0],
        name: meeting.meeting_title,
        project: { name: meeting.project_name },
        date_time: meeting.date_time,
      }));

      setCalendarEvents([...(calendarResponse.data.events || []), ...meetingsEvents]);

      const notificationsResponse = await axios.get(`${API_BASE_URL}/api/getusernotifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotificationCount(notificationsResponse.data.count);

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
    setCalendarKey((prevKey) => prevKey + 1);
  }, [currentDate]);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/');
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

      const dayProjects = calendarEvents.filter(
        (e) =>
          e.type === 'project' &&
          e.start === dateStr &&
          (e.grade === undefined ||
            e.grade === null ||
            e.grade === '' ||
            e.grade === '-') &&
          (e.feedback === undefined || e.feedback === null || e.feedback === ''),
      );

      const dayTasks = calendarEvents.filter(
        (e) => e.type === 'task' && e.start === dateStr && e.status === 'In Progress',
      );

      const dayMeetings = calendarEvents.filter(
        (e) =>
          e.type === 'meeting' &&
          e.start === dateStr &&
          e.start >= today,
      );

      daysArray.push({
        day,
        dateStr,
        projects: dayProjects,
        tasks: dayTasks,
        meetings: dayMeetings,
        isToday: dateStr === today,
        isOverdue: dateStr < today && (dayProjects.length > 0 || dayTasks.length > 0),
        hasFuture:
          dateStr > today &&
          (dayProjects.length > 0 || dayTasks.length > 0 || dayMeetings.length > 0),
        totalItems: dayProjects.length + dayTasks.length + dayMeetings.length,
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
      day: 'numeric',
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
          <div className={styles.logo}>
            {username.split(' ').map((word) => word.charAt(0).toUpperCase()).join('')}
          </div>
          <div className={styles.brandText}>
            <h2 className={styles.brandTextH2}>{username}</h2>
            <small className={styles.brandTextSmall}>{email}</small>
          </div>
        </div>

        <nav className={styles.nav}>
          <button className={styles.navBtn} onClick={() => setShowProfileModal(true)}>
            <FontAwesomeIcon icon={faUser} /> Profile
          </button>
          <button className={styles.navBtn}>
            <span style={{ position: 'relative', marginRight: '5px' }}>
              <FontAwesomeIcon icon={faBell} />
              {notificationCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    minWidth: '15px',
                    height: '15px',
                    fontSize: '0.8em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {notificationCount}
                </span>
              )}
            </span>
            Notifications
          </button>
          <button className={styles.navBtn} onClick={logout}>
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Projects Table */}
        <section className={styles.panel}>
          <div className={styles.panelHead} style={{ justifyContent: 'center' }}>
            <h2 className={styles.panelHeadH2}>Projects Overview</h2>
          </div>
          <button
            className={styles.addBtn}
            onClick={() => setShowNewProjectModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Create New Project
          </button>
          {showNewProjectModal && (
            <NewProjectModal
              onClose={() => setShowNewProjectModal(false)}
              onSuccess={() => {
                fetchDashboardData();
                setShowNewProjectModal(false);
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
                  <td className={styles.wrappableCell}>{project.project_name}</td>
                  <td>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progress}
                        style={{ width: `${project.progress || 0}%` }}
                      />
                      <span className={styles.progressText}>
                        {project.progress || 0}%
                      </span>
                    </div>
                  </td>
                  <td className={styles.wrappableCell}>{project.dueDate}</td>
                  <td>
                    <button
                      className={styles.openBtn}
                      onClick={() => handleOpenDashboard(project)}
                    >
                      Open
                    </button>
                  </td>
                  <td className={styles.wrappableCell}>{project.role}</td>
                  <td className={styles.wrappableCell}>{project.grade || '-'}</td>
                  <td>
                    {project.role === 'Supervisor' && (
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowDeleteModal(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          marginLeft: '8px',
                        }}
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
                        fetchDashboardData();
                      }}
                    />
                  )}
                  {showProfileModal && (
                    <ProfileModal
                      onClose={() => setShowProfileModal(false)}
                      onSuccess={() => {
                        fetchDashboardData();
                        setShowProfileModal(false);
                      }}
                      email={email}
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
              <h3 className={styles.panelHeadH3}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button className={styles.calendarNavBtn} onClick={nextMonth}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            <div className={styles.calendarGrid}>
              {days.map((day, index) => (
                <div key={`header-${index}`} className={styles.calendarHeaderCell}>
                  {day}
                </div>
              ))}
              {getDaysInMonth().map((dayData, index) => (
                <div
                  key={`day-${index}`}
                  className={`${styles.calendarCell} ${
                    dayData
                      ? dayData.isToday
                        ? styles.calendarCellToday
                        : dayData.isOverdue
                        ? styles.calendarCellOverdue
                        : dayData.hasFuture
                        ? styles.calendarCellFuture
                        : ''
                      : styles.calendarCellEmpty
                  }`}
                  onClick={() => dayData && setSelectedDate(dayData.dateStr)}
                >
                  {dayData ? (
                    <>
                      <div
                        className={`${styles.calendarDayNumber} ${
                          dayData.isToday ? styles.calendarDayNumberToday : ''
                        }`}
                      >
                        {dayData.day}
                      </div>
                      {dayData.projects.length > 0 && (
                        <div className={styles.calendarCellProjects}>
                          {dayData.projects.slice(0, 3).map((p, i) => (
                            <span
                              key={`proj-${i}`}
                              className={styles.calendarCellProject}
                            ></span>
                          ))}
                          {dayData.projects.length > 3 && (
                            <span
                              className={`${styles.calendarCellExtra} ${
                                dayData.isToday ? styles.calendarCellExtraToday : ''
                              }`}
                            >
                              +{dayData.projects.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      {dayData.tasks.length > 0 && (
                        <div className={styles.calendarCellEvents}>
                          {dayData.tasks.slice(0, 3).map((t, i) => (
                            <span
                              key={`task-${i}`}
                              className={styles.calendarCellEvent}
                            ></span>
                          ))}
                          {dayData.tasks.length > 3 && (
                            <span
                              className={`${styles.calendarCellExtra} ${
                                dayData.isToday ? styles.calendarCellExtraToday : ''
                              }`}
                            >
                              +{dayData.tasks.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      {dayData.meetings.length > 0 && (
                        <div className={styles.calendarCellMeetings}>
                          {dayData.meetings.slice(0, 3).map((m, i) => (
                            <span
                              key={`meet-${i}`}
                              className={styles.calendarCellMeeting}
                            ></span>
                          ))}
                          {dayData.meetings.length > 3 && (
                            <span
                              className={`${styles.calendarCellExtra} ${
                                dayData.isToday ? styles.calendarCellExtraToday : ''
                              }`}
                            >
                              +{dayData.meetings.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              ))}
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
                  <div className={styles.calendarLegendMeeting}></div>
                  <span>Meeting</span>
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

                  {calendarEvents.filter(
                    (e) =>
                      e.type === 'project' &&
                      e.start === selectedDate &&
                      (e.grade === undefined ||
                        e.grade === null ||
                        e.grade === '' ||
                        e.grade === '-') &&
                      (e.feedback === undefined ||
                        e.feedback === null ||
                        e.feedback === ''),
                  ).length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 className={styles.selectedDateProjectsHeader}>
                        📁 Projects (
                        {calendarEvents.filter(
                          (e) =>
                            e.type === 'project' &&
                            e.start === selectedDate &&
                            (e.grade === undefined ||
                              e.grade === null ||
                              e.grade === '' ||
                              e.grade === '-') &&
                            (e.feedback === undefined ||
                              e.feedback === null ||
                              e.feedback === ''),
                        ).length}
                        )
                      </h4>
                      <ul className={styles.selectedDateList}>
                        {calendarEvents
                          .filter(
                            (e) =>
                              e.type === 'project' &&
                              e.start === selectedDate &&
                              (e.grade === undefined ||
                                e.grade === null ||
                                e.grade === '' ||
                                e.grade === '-') &&
                              (e.feedback === undefined ||
                                e.feedback === null ||
                                e.feedback === ''),
                          )
                          .map((project, index) => (
                            <li
                              key={`proj-${index}`}
                              className={`${
                                styles.selectedDateListItem
                              } ${
                                index % 2 === 0 ? '' : styles.selectedDateListItemAlt
                              }`}
                            >
                              <div className={styles.selectedDateItemTitle}>
                                <FontAwesomeIcon
                                  icon={faProjectDiagram}
                                  style={{ color: '#228693' }}
                                />
                                {project.name}
                              </div>
                              <div className={styles.selectedDateItemMeta}>
                                <span>
                                  Role:{' '}
                                  <span
                                    className={
                                      project.role.toLowerCase() === 'supervisor'
                                        ? styles.selectedDateItemRoleSupervisor
                                        : styles.selectedDateItemRoleOther
                                    }
                                  >
                                    {project.role}
                                  </span>
                                </span>
                                {project.description && (
                                  <span className={styles.selectedDateItemDescription}>
                                    {project.description.length > 50
                                      ? `${project.description.substring(0, 50)}...`
                                      : project.description}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {calendarEvents.filter(
                    (e) =>
                      e.type === 'task' &&
                      e.start === selectedDate &&
                      e.status === 'In Progress',
                  ).length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 className={styles.selectedDateEventsHeader}>
                        🗓️ Tasks (
                        {calendarEvents.filter(
                          (e) =>
                            e.type === 'task' &&
                            e.start === selectedDate &&
                            e.status === 'In Progress',
                        ).length}
                        )
                      </h4>
                      <ul className={styles.selectedDateList}>
                        {calendarEvents
                          .filter(
                            (e) =>
                              e.type === 'task' &&
                              e.start === selectedDate &&
                              e.status === 'In Progress',
                          )
                          .map((task, index) => (
                            <li
                              key={`task-${index}`}
                              className={`${
                                styles.selectedDateListItem
                              } ${
                                index % 2 === 0 ? '' : styles.selectedDateListItemAlt
                              }`}
                            >
                              <div className={styles.selectedDateItemTitle}>
                                <FontAwesomeIcon
                                  icon={faTasks}
                                  style={{ color: '#228693' }}
                                />
                                {task.name}
                              </div>
                              <div className={styles.selectedDateItemMeta}>
                                <span>
                                  Project:{' '}
                                  <span className={styles.selectedDateItemProgress}>
                                    {task.project
                                      ? task.project.name
                                      : 'No associated project'}
                                  </span>
                                </span>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {calendarEvents.filter(
                    (e) =>
                      e.type === 'meeting' &&
                      e.start === selectedDate &&
                      e.start >= new Date().toISOString().split('T')[0],
                  ).length > 0 && (
                    <div>
                      <h4 className={styles.selectedDateEventsHeader}>
                        📅 Meetings (
                        {calendarEvents.filter(
                          (e) =>
                            e.type === 'meeting' &&
                            e.start === selectedDate &&
                            e.start >= new Date().toISOString().split('T')[0],
                        ).length}
                        )
                      </h4>
                      <ul className={styles.selectedDateList}>
                        {calendarEvents
                          .filter(
                            (e) =>
                              e.type === 'meeting' &&
                              e.start === selectedDate &&
                              e.start >= new Date().toISOString().split('T')[0],
                          )
                          .map((meeting, index) => (
                            <li
                              key={`meeting-${index}`}
                              className={`${
                                styles.selectedDateListItem
                              } ${
                                index % 2 === 0 ? '' : styles.selectedDateListItemAlt
                              }`}
                            >
                              <div className={styles.selectedDateItemTitle}>
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  style={{ color: '#228693' }}
                                />
                                {meeting.name}
                              </div>
                              <div className={styles.selectedDateItemMeta}>
                                <span>
                                  Time:{' '}
                                  <span className={styles.selectedDateItemProgress}>
                                    {meeting.date_time.split(' ')[1]}
                                  </span>
                                </span>
                                <span>
                                  Project:{' '}
                                  <span className={styles.selectedDateItemProgress}>
                                    {meeting.project
                                      ? meeting.project.name
                                      : 'No associated project'}
                                  </span>
                                </span>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {calendarEvents.filter(
                    (e) =>
                      e.start === selectedDate &&
                      ((e.type === 'project' &&
                        (e.grade === undefined ||
                          e.grade === null ||
                          e.grade === '' ||
                          e.grade === '-') &&
                        (e.feedback === undefined ||
                          e.feedback === null ||
                          e.feedback === '')) ||
                        (e.type === 'task' && e.status === 'In Progress') ||
                        (e.type === 'meeting' &&
                          e.start >= new Date().toISOString().split('T')[0])),
                  ).length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateTitle}>🎉 Great work!</div>
                      <div className={styles.emptyStateMessage}>
                        No ungraded projects, in-progress tasks, or meetings scheduled
                        for {formatDateForDisplay(selectedDate)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateTitle}>📅 Select a date</div>
                  <div className={styles.emptyStateInstructions}>
                    Click on any date in the calendar to view ungraded projects and
                    in-progress tasks scheduled for that day
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
            <button className={styles.iconBtn}>
              <FontAwesomeIcon icon={faCalendar} />
            </button>
          </div>
          <ul className={styles.list}>
            {projects.slice(0, 5).map((project, index) => (
              <li key={index}>
                <FontAwesomeIcon icon={faProjectDiagram} /> {project.project_name} -{' '}
                {project.dueDate}
              </li>
            ))}
            {projects.length === 0 && (
              <li style={{ color: '#666', fontStyle: 'italic' }}>
                No upcoming deadlines
              </li>
            )}
          </ul>
        </section>
      </aside>
    </div>
  );
};

export default Dashboard;