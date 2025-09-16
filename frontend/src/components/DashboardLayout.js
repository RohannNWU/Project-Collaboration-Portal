//----------------------------------------
// Dashboard Layout (Sidebar + Main + Rightbar)
//----------------------------------------

import React, { useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder, 
  faCheckCircle, 
  faUsers, 
  faCalendar, 
  faCodeBranch,
  faFile, 
  faInbox, 
  faPlus, 
  faComment, 
  faUpload,
  faProjectDiagram,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Dashboard.module.css";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  useEffect(() => {
    // Initialize calendar if FullCalendar is available
    if (calendarRef.current && window.FullCalendar) {
      const calendar = new window.FullCalendar.Calendar(calendarRef.current, {
        initialView: "dayGridMonth",
        height: 300,
        events: [
          { title: "CMPG 321 Deadline", start: "2025-11-11" },
          { title: "CMPG 323 Deadline", start: "2025-10-06" },
          { title: "CMPG 311 Presentation", start: "2025-09-21" },
          { title: "Team Meeting", start: "2025-09-15T14:00:00" }
        ]
      });
      calendar.render();

      return () => {
        calendar.destroy();
      };
    }
  }, []);

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>NWU</div>
          <div className={styles.brandText}>
            <h2 onClick={() => navigate("/dashboard")}>
              Project Collaboration Portal
            </h2>
            <small>Student</small>
          </div>
        </div>

        <nav className={styles.nav}>
          <button className={styles.navBtn} onClick={() => navigate("/dashboard")}>
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

export default DashboardLayout;