//----------------------------------------
// Dashboard Home (default middle content)
//----------------------------------------

import React, { useRef, useEffect } from "react";
import styles from "./Dashboard.module.css";

const DashboardHome = () => {
  const progressChartRef = useRef(null);
  const workloadChartRef = useRef(null);

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
        }
      });

      return () => {
        progressChart.destroy();
        workloadChart.destroy();
      };
    }
  }, []);

  return (
    <div>
      {/* KPIs */}
      <section className={styles.cards}>
        <div className={styles.card}><p>Active Projects</p><h2>3</h2></div>
        <div className={styles.card}><p>Tasks Due This Week</p><h2>7</h2></div>
        <div className={styles.card}><p>Unread Messages</p><h2>2</h2></div>
      </section>

      {/* Projects Table */}
      <section className={styles.panel}>
        <div className={styles.panelHead}><h2>My Projects</h2></div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th><th>Progress</th><th>Due Date</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CMPG 321</td>
              <td><div className={styles.progressBar}><div className={styles.progress} style={{ width: "80%" }}></div></div></td>
              <td>11/11/2025</td>
              <td><button className={styles.editBtn}>Edit</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Charts */}
      <section className={styles.charts}>
        <div className={styles.chartCard}>
          <h3>Weekly Progress</h3>
          <canvas ref={progressChartRef}></canvas>
        </div>
        <div className={styles.chartCard}>
          <h3>Workload by Area</h3>
          <canvas ref={workloadChartRef}></canvas>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
