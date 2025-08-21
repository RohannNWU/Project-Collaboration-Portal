import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// It's recommended to manage external libraries like Chart.js via npm
// and import them here. For example:
// import { Chart } from 'chart.js';
// import { Line, Doughnut } from 'react-chartjs-2';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Any logic that was in an external `script.js` for DOM manipulation
    // should be handled here with React state and effects.
    // For example, to initialize charts or fetch data.

    // To set the year in the footer:
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }, []); // Empty dependency array means this runs once on mount.

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user'); // clear user session
    navigate('/');                   // redirect to login
  };

  if (!user) return null;

  // The JSX should only contain the content for the dashboard,
  // not the entire HTML page structure with <head>, <body>, etc.
  // Also, in JSX, the 'class' attribute must be written as 'className'.
  return (
    <div>
        <aside className="sidebar">
          <div className="brand">
            <div className="logo">NWU</div>
            <div className="brand-text">
              <h2>Project Collaboration Portal</h2>
              <small>Student</small>
            </div>
          </div>

          <nav className="nav">
            <button className="nav
          </nav>

          <div class="quick-actions">
            <button class="qa-btn" id="qa-new-project">＋ New Project</button>
            <button class="qa-btn" id="qa-new-task">＋ New Task</button>
            <button class="qa-btn" id="qa-message-team">💬 Message Team</button>
            <button class="qa-btn" id="qa-upload">⬆️ Upload File</button>
            <button class="qa-btn" id="qa-logout" onClick={handleLogout}>↩ Logout</button>
          </div>
        </aside>

        
        <main class="main">
          
          <header class="topbar">
            <div class="tb-left">
              <h1>Project Collaboration Portal</h1>
              <span class="badge">Student</span>
            </div>
            <div class="tb-right">
              <div class="search">
                <input id="searchInput" type="text" placeholder="Search projects, tasks, people…" />
                <svg class="search-ico" viewBox="0 0 24 24"><path d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm11 3-6-6" /></svg>
              </div>
              <button class="icon-btn" title="Notifications">🔔</button>
              <button class="icon-btn" title="Settings">⚙️</button>
              <div class="user">
                <div class="avatar">JM</div>
                <span class="username">{user.username}</span>
                <button class="icon-btn" title="Logout">↩</button>
              </div>
            </div>
          </header>

          
          <section class="cards">
            <div class="card">
              <p>Active Projects</p>
              <h2 id="kpi-projects">0</h2>
            </div>
            <div class="card">
              <p>Tasks Due This Week</p>
              <h2 id="kpi-tasks-week">0</h2>
            </div>
            <div class="card">
              <p>Unread Messages</p>
              <h2 id="kpi-messages">0</h2>
            </div>
          </section>

          
          <section class="panel">
            <div class="panel-head">
              <h2>My Projects</h2>
              <div class="tabs">
                <button class="tab active" data-filter="all">All</button>
                <button class="tab" data-filter="On Track">On Track</button>
                <button class="tab" data-filter="At Risk">At Risk</button>
                <button class="tab" data-filter="Review">Review</button>
              </div>
            </div>
            <div id="projectList" class="project-list"></div>
          </section>

          
          <section class="charts">
            <div class="chart-card">
              <div class="panel-head"><h3>Weekly Progress</h3></div>
              <canvas id="progressChart"></canvas>
            </div>
            <div class="chart-card">
              <div class="panel-head"><h3>Workload by Area</h3></div>
              <canvas id="workloadChart"></canvas>
            </div>
          </section>
        </main>

        
        <aside class="rightbar">
          <section class="panel">
            <div class="panel-head">
              <h3>Upcoming Deadlines</h3>
              <button class="icon-btn">📅</button>
            </div>
            <ul id="deadlineList" class="list"></ul>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h3>Team Activity</h3>
              <span class="live">Live</span>
            </div>
            <ul id="activityList" class="list"></ul>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h3>Inbox</h3>
              <button class="icon-btn">✉️</button>
            </div>
            <ul id="inboxList" class="list"></ul>
          </section>

          <section class="panel">
            <div class="panel-head"><h3>Getting Started</h3></div>
            <ul class="bullet">
              <li>Connect your Git repository</li>
              <li>Invite teammates to your workspace</li>
              <li>Create your first sprint board</li>
              <li>Enable calendar sync</li>
            </ul>
          </section>

          <footer class="footer">
            © <span id="year"></span> Project Collaboration Portal · Student Dashboard
          </footer>
        </aside>

        <script src="script.js"></script>
      </body>
    </div>
  );
}

export default Dashboard;
