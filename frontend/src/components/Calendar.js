import React from "react";
import styles from "./Calendar.module.css"; 

//----------------------------------------
//  Calendar Page Component 
//----------------------------------------

/**
 * Calendar component for displaying and managing project deadlines and events.
 * 
 * @component
 * @returns {JSX.Element} The rendered calendar page with header and placeholder content.
 */

const Calendar = () => {
  return (
    <div className={styles.calendarPage}>
      <header className={styles.header}>
        <h1>📅 Calendar</h1>
        <p>View and manage your project deadlines and events here.</p>
      </header>
//----------------------------------------
//  Still to add a proper calendar view 
//----------------------------------------
      <div className={styles.calendarBody}>
        <p>Calendar content goes here (placeholder for now).</p>
      </div>
    </div>
  );
};

export default Calendar;
