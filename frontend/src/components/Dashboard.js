import React, { useEffect } from 'react';
import styles from './Dashboard.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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

        if (!accessToken) {
          throw new Error('No access token found');
        }

        const response = await fetch(`${API_BASE_URL}/protected/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Protected data:', data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>NWU</div>
          <div className={styles.brandText}>
            <h2>Project Collaboration Portal</h2>
            <small>Student</small>
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
          <button className={styles.qaBtn} id="qa-new-project">＋ New Project</button>
          <button className={styles.qaBtn} id="qa-new-task">＋ New Task</button>
          <button className={styles.qaBtn} id="qa-message-team">💬 Message Team</button>
          <button className={styles.qaBtn} id="qa-upload">⬆️ Upload File</button>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.tbLeft}>
            <h1>Project Collaboration Portal</h1>
            <span className={styles.badge}>Student</span>
          </div>
          <div className={styles.tbRight}>
            <div className={styles.search}>
              <input id="searchInput" type="text" placeholder="Search projects, tasks, people…" />
              <svg className={styles.searchIco} viewBox="0 0 24 24"><path d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm11 3-6-6" /></svg>
            </div>
            <button className={styles.iconBtn} title="Notifications"><FontAwesomeIcon icon={faBell} /></button>
            <button className={styles.iconBtn} title="Settings"><FontAwesomeIcon icon={faGear} /></button>
            <div className={styles.user}>
              <div className={styles.avatar}>JM</div>
              <span className={styles.username}>John M.</span>
              <button className={styles.iconBtn} title="Logout"><FontAwesomeIcon icon={faSignOutAlt} /></button>
            </div>
          </div>
        </header>

        <section className={styles.cards}>
          <div className={styles.card}>
            <p>Active Projects</p>
            <h2 id="kpi-projects">0</h2>
          </div>
          <div className={styles.card}>
            <p>Tasks Due This Week</p>
            <h2 id="kpi-tasks-week">0</h2>
          </div>
          <div className={styles.card}>
            <p>Unread Messages</p>
            <h2 id="kpi-messages">0</h2>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>My Projects</h2>
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${styles.active}`} data-filter="all">All</button>
              <button className={styles.tab} data-filter="On Track">On Track</button>
              <button className={styles.tab} data-filter="Review">Review</button>
            </div>
          </div>
          <div id="projectList" className={styles.projectList}></div>
        </section>

        <section className={styles.charts}>
          <div className={styles.chartCard}>
            <div className={styles.panelHead}><h3>Weekly Progress</h3></div>
            <canvas id="progressChart"></canvas>
          </div>
          <div className={styles.chartCard}>
            <div className={styles.panelHead}><h3>Workload by Area</h3></div>
            <canvas id="workloadChart"></canvas>
          </div>
        </section>
      </main>

      <aside className={styles.rightbar}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Upcoming Deadlines</h3>
            <button className={styles.iconBtn}>📅</button>
          </div>
          <ul id="deadlineList" className={styles.list}></ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Team Activity</h3>
            <span className={styles.live}>Live</span>
          </div>
          <ul id="activityList" className={styles.list}></ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Inbox</h3>
            <button className={styles.iconBtn}>✉️</button>
          </div>
          <ul id="inboxList" className={styles.list}></ul>
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
          © <span id="year"></span> Project Collaboration Portal · Student Dashboard
        </footer>
      </aside>
    </div>
  );
};

export default Dashboard;