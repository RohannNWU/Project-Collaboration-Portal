import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [projects] = useState([]); // empty for now

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

  return (
    <div>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Student Dashboard · Project Collaboration Portal</title>
        <link rel="stylesheet" href="styles.css" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>
        <aside class="sidebar">
          <div class="brand">
            <div class="logo">NWU</div>
            <div class="brand-text">
              <h2>Project Collaboration Portal</h2>
              <small>Student</small>
            </div>
          </div>

          <nav class="nav">
            <button class="nav-btn"><span>📁</span> My Projects</button>
            <button class="nav-btn"><span>✅</span> My Tasks</button>
            <button class="nav-btn"><span>👥</span> Teams</button>
            <button class="nav-btn"><span>📅</span> Calendar</button>
            <button class="nav-btn"><span>🌿</span> Repos</button>
            <button class="nav-btn"><span>📄</span> Documents</button>
            <button class="nav-btn"><span>✉️</span> Inbox</button>
          </nav>

          <div class="quick-actions">
            <button class="qa-btn" id="qa-new-project">＋ New Project</button>
            <button class="qa-btn" id="qa-new-task">＋ New Task</button>
            <button class="qa-btn" id="qa-message-team">💬 Message Team</button>
            <button class="qa-btn" id="qa-upload">⬆️ Upload File</button>
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
                <span class="username">John M.</span>
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
