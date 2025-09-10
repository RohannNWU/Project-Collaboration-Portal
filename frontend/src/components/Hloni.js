// components/Hloni.js
import React, { useEffect, useRef } from 'react';
import './Hloni.css'; // We'll create this next

const Hloni = () => {
  const calendarRef = useRef(null);
  const progressChartRef = useRef(null);
  const workloadChartRef = useRef(null);

  useEffect(() => {
    // Initialize calendar after component mounts
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
    }

    // Initialize charts
    if (progressChartRef.current && workloadChartRef.current && window.Chart) {
      // Progress Chart
      new window.Chart(progressChartRef.current, {
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
        }
      });
      
      // Workload Chart
      new window.Chart(workloadChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['CMPG 321', 'CMPG 323', 'CMPG 311'],
          datasets: [{
            data: [40, 35, 25],
            backgroundColor: [
              '#3498db',
              '#2ecc71',
              '#e74c3c'
            ]
          }]
        }
      });
    }
  }, []);

  const logout = () => {
    alert("You have been logged out!");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* Your entire HTML content goes here, converted to JSX */}
      {/* Example: */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">NWU</div>
          <div className="brand-text">
            <h2>Project Collaboration Portal</h2>
            <small>Student</small>
          </div>
        </div>
        
        {/* Continue with the rest of your HTML structure */}
        {/* ... */}
      </aside>
      
      {/* Rest of your HTML content converted to JSX */}
    </div>
  );
};

export default Hloni;
