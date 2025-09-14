import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
<<<<<<< HEAD
import { faFolder, faCheckCircle, faUsers, faCalendar, faCodeBranch, faFile, faInbox, faBell, faGear, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

//----------------------------------------
//  Dashboard Page Component
//----------------------------------------

const Dashboard = () => {
  //----------------------------------------
  // Initialize navigation hook
  //----------------------------------------
  const navigate = useNavigate();

  useEffect(() => {
    //----------------------------------------
    // Fetch protected data on component mount
    //----------------------------------------
    const fetchData = async () => {
      try {
        const API_BASE_URL = window.location.hostname === 'localhost'
          ? 'http://127.0.0.1:8000'
          : 'https://pcp-backend-f4a2.onrender.com';
        const accessToken = localStorage.getItem('access_token');
=======
import {
  faFolder, faCheckCircle, faUsers, faCalendar, faCodeBranch, faFile, faInbox,
  faBell, faCog, faSignOutAlt, faPlus, faSearch, faEnvelope, faProjectDiagram,
  faUserCheck, faComment, faUpload
} from '@fortawesome/free-solid-svg-icons';
import styles from './Dashboard.module.css';

const getUserEmail = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser).email : 'Anonymous User';
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e);
    return 'Student';
  }
};

const Dashboard = () => {
  const [email, setEmail] = useState(getUserEmail());
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const progressChartRef = useRef(null);
  const workloadChartRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }
>>>>>>> rohann

    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

    axios.get(`${API_BASE_URL}/api/dashboard/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setEmail(response.data.email);
        setUsername(response.data.username);
      })
      .catch(err => {
        if (err.response && err.response.status === 401) {
          navigate('/');
        }
      });

    // Initialize calendar
    if (calendarRef.current && window.FullCalendar) {
      const calendar = new window.FullCalendar.Calendar(calendarRef.current, {
        initialView: "dayGridMonth",
        height: 400,
        events: [
          { title: "CMPG 321 Deadline", start: "2025-11-11" },
          { title: "CMPG 323 Deadline", start: "2025-10-06" },
          { title: "CMPG 311 Presentation", start: "2025-09-21" },
          { title: "Team Meeting", start: "2025-09-15T14:00:00" }
        ]
      });
      calendar.render();

      // Cleanup calendar on unmount
      return () => calendar.destroy();
    } else {
      console.warn('FullCalendar is not available');
    }

    // Initialize charts
    if (progressChartRef.current && workloadChartRef.current && window.Chart) {
      const progressChart = new window.Chart(progressChartRef.current, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Tasks Completed',
            data: [3, 5, 2, 6, 4, 3, 2],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' }
          }
        }
      });

      const workloadChart = new window.Chart(workloadChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['CMPG 321', 'CMPG 323', 'CMPG 311'],
          datasets: [{
            data: [40, 35, 25],
            backgroundColor: ['#3498db', '#2ecc71', '#e74c3c']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });

      // Cleanup charts on unmount
      return () => {
        progressChart.destroy();
        workloadChart.destroy();
      };
    } else {
      console.warn('Chart.js is not available');
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate("/");
  };

  const createNewProject = () => {
    navigate('/newproject');
  };

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>NWU</div>
          <div className={styles.brandText}>
            <h2>Project Collaboration Portal</h2>
            <small>{email}</small>
          </div>
        </div>

        <nav className={styles.nav}>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faFolder} /> My Projects</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faCheckCircle} /> My Tasks</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faUsers} /> Teams</button>
          {/*----------------------------------------
          - Navigation to Calendar Page
          ----------------------------------------*/}
          <button 
            className={styles.navBtn} 
            onClick={() => navigate("/calendar")}   // ✅ this makes it work
          >
            <FontAwesomeIcon icon={faCalendar} /> Calendar
          </button>
          
          <button className={styles.navBtn}><FontAwesomeIcon icon={faCodeBranch} /> Repos</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faFile} /> Documents</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faInbox} /> Inbox</button>
        </nav>

        <div className={styles.quickActions}>
          <button className={styles.qaBtn} onClick={createNewProject}><FontAwesomeIcon icon={faPlus} /> New Project</button>
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
              <span className={styles.username}>{username}</span>
              <div className={styles.avatar}>JM</div>
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
            <h2 id="kpi-projects">3</h2>
          </div>
          <div className={styles.card}>
            <p>Tasks Due This Week</p>
            <h2 id="kpi-tasks-week">7</h2>
          </div>
          <div className={styles.card}>
            <p>Unread Messages</p>
            <h2 id="kpi-messages">2</h2>
          </div>
        </section>

        {/* Projects Table */}
        <section className={styles.panel}>
          <div className={styles.panelHead}>
<<<<<<< HEAD
            <h2>My Projects</h2>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${styles.active}`} data-filter="all">All</button>
              <button className={styles.tab} data-filter="On Track">On Track</button>
              <button className={styles.tab} data-filter="Review">Review</button>
            </div>
=======
            <h2>Projects Overview</h2>
>>>>>>> rohann
          </div>
          <button className={styles.addBtn} onClick={createNewProject}>+ Add Project</button>
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
              <tr>
                <td>CMPG 321</td>
                <td>
                  <div className={styles.progressBar}>
                    <div className={styles.progress} style={{ width: '80%' }}></div>
                  </div>
                </td>
                <td>11/11/2025</td>
                <td><button className={styles.editBtn}>Edit</button></td>
                <td><input type="checkbox" /></td>
              </tr>
              <tr>
                <td>CMPG 323</td>
                <td>
                  <div className={styles.progressBar}>
                    <div className={styles.progress} style={{ width: '50%' }}></div>
                  </div>
                </td>
                <td>06/10/2025</td>
                <td><button className={styles.editBtn}>Edit</button></td>
                <td><input type="checkbox" /></td>
              </tr>
              <tr>
                <td>CMPG 311</td>
                <td>
                  <div className={styles.progressBar}>
                    <div className={styles.progress} style={{ width: '20%' }}></div>
                  </div>
                </td>
                <td>21/09/2025</td>
                <td><button className={styles.editBtn}>Edit</button></td>
                <td><input type="checkbox" /></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Charts */}
        <section className={styles.charts}>
          <div className={styles.chartCard}>
            <div className={styles.panelHead}><h3>Weekly Progress</h3></div>
            <canvas ref={progressChartRef} id="progressChart"></canvas>
          </div>
          <div className={styles.chartCard}>
            <div className={styles.panelHead}><h3>Workload by Area</h3></div>
            <canvas ref={workloadChartRef} id="workloadChart"></canvas>
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
            <li><FontAwesomeIcon icon={faProjectDiagram} /> CMPG 311 - Sep 21</li>
            <li><FontAwesomeIcon icon={faProjectDiagram} /> CMPG 323 - Oct 6</li>
            <li><FontAwesomeIcon icon={faProjectDiagram} /> CMPG 321 - Nov 11</li>
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Team Activity</h3>
            <span className={styles.live}>Live</span>
          </div>
          <ul className={styles.list}>
            <li><FontAwesomeIcon icon={faUserCheck} /> Sarah updated CMPG 323 documentation</li>
            <li><FontAwesomeIcon icon={faUserCheck} /> Michael completed task: API integration</li>
            <li><FontAwesomeIcon icon={faUserCheck} /> You uploaded meeting_notes.pdf</li>
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

        <section className={styles.panel}>
          <div className={styles.panelHead}><h3>Student Calendar</h3></div>
          <div ref={calendarRef} id="calendar"></div>
        </section>

        <footer className={styles.footer}>
          © {new Date().getFullYear()} Project Collaboration Portal · Student Dashboard
        </footer>
      </aside>
    </div>
  );
};

export default Dashboard;