//----------------------------------------
// Dashboard Layout (Sidebar + Main + Rightbar)
//----------------------------------------

import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder, faCheckCircle, faUsers, faCalendar, faCodeBranch,
  faFile, faInbox, faPlus, faComment, faUpload
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Dashboard.module.css";

const DashboardLayout = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>NWU</div>
          <div className={styles.brandText}>
            <h2 onClick={() => navigate("/dashboard")}>
              Project Collaboration Portal</h2>
            <small>Student</small>
          </div>
        </div>

        <nav className={styles.nav}>
          <button className={styles.navBtn} onClick={() => navigate("/dashboard/newproject")}>
            <FontAwesomeIcon icon={faFolder} /> My Projects
          </button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faCheckCircle} /> My Tasks</button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faUsers} /> Teams</button>
          <button className={styles.navBtn} onClick={() => navigate("/dashboard/calendar")}>
            <FontAwesomeIcon icon={faCalendar} /> Calendar
          </button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faCodeBranch} /> Repos</button>
          <button className={styles.navBtn} onClick={() => navigate("/dashboard/documents")}>
            <FontAwesomeIcon icon={faFile} /> Documents
          </button>
          <button className={styles.navBtn}><FontAwesomeIcon icon={faInbox} /> Inbox</button>
        </nav>

        <div className={styles.quickActions}>
          <button className={styles.qaBtn}><FontAwesomeIcon icon={faPlus} /> New Project</button>
          <button className={styles.qaBtn}><FontAwesomeIcon icon={faPlus} /> New Task</button>
          <button className={styles.qaBtn} onClick={() => navigate("/dashboard/chatwindow")}>
            <FontAwesomeIcon icon={faComment} /> Message Team
            </button>

          <button className={styles.qaBtn} onClick={() => navigate("/dashboard/documents")}>
            <FontAwesomeIcon icon={faUpload} /> Upload File
          </button>
        </div>
      </aside>

      {/* Middle (dynamic via Outlet) */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Right Sidebar */}
      <aside className={styles.rightbar}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Upcoming Deadlines</h3>
          </div>
          <ul className={styles.list}>
            <li>Project A - Sep 21</li>
            <li>Project B - Oct 6</li>
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Team Activity</h3>
            <span className={styles.live}>Live</span>
          </div>
          <ul className={styles.list}>
            <li>Sarah updated CMPG 323 documentation</li>
            <li>Michael completed API integration</li>
            <li>You uploaded meeting_notes.pdf</li>
          </ul>
        </section>
      </aside>
    </div>
  );
};

export default DashboardLayout;
