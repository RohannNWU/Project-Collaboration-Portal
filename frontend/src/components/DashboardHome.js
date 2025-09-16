//----------------------------------------
// Dashboard Home (default middle content)
//----------------------------------------

import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBell,
  faCog,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Dashboard.module.css";

const DashboardHome = () => {
  const progressChartRef = useRef(null);
  const workloadChartRef = useRef(null);

  const logout = () => {
    // Logout functionality here
    console.log("Logging out...");
  };

  useEffect(() => {
    if (progressChartRef.current && workloadChartRef.current && window.Chart) {
      const progressChart = new window.Chart(progressChartRef.current, {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [{
            label: "Tasks Completed",
            data: [3, 5, 2, 6, 4, 3, 2],
            borderColor: "#3498db",
            backgroundColor: "rgba(52, 152, 219, 0.1)",
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
        type: "doughnut",
        data: {
          labels: ["CMPG 321", "CMPG 323", "CMPG 311"],
          datasets: [{
            data: [40, 35, 25],
            backgroundColor: ["#3498db", "#2ecc71", "#e74c3c"]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });

      return () => {
        progressChart.destroy();
        workloadChart.destroy();
      };
    }
  }, []);

  return (
    <>
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
              <div className={styles.avatar}>JM</div>
              <span className={styles.username}>John M.</span>
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
            <h2>Projects Overview</h2>
          </div>
          <button className={styles.addBtn}>+ Add Project</button>
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
                    <div className={styles.progress} style={{width: '80%'}}></div>
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
                    <div className={styles.progress} style={{width: '50%'}}></div>
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
                    <div className={styles.progress} style={{width: '20%'}}></div>
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
    </>
  );
};

export default DashboardHome;