import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import styles from "./NotificationModal.module.css";

const NotificationModal = ({ isOpen, onClose, buttonPosition }) => {
  const [notifications, setNotifications] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState(null);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }
      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://127.0.0.1:8000"
          : "https://pcp-backend-f4a2.onrender.com";
      const response = await axios.get(`${API_BASE_URL}/api/getusernotifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let fetchedNotifications;
      if (Array.isArray(response.data.notifications)) {
        fetchedNotifications = response.data.notifications;
      } else if (Array.isArray(response.data)) {
        fetchedNotifications = response.data;
      } else {
        throw new Error("Invalid response format");
      }

      fetchedNotifications.sort((a, b) => new Date(b.time_sent) - new Date(a.time_sent));
      setNotifications(fetchedNotifications);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.error || "Failed to fetch notifications.");
      setNotifications([]);
    }
  }, []);  // <-- Added empty dependency array

  // Fetch notifications whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Delete one notification
  const handleRemove = async (notifId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }

      if (notifId === undefined || notifId === null) {
        console.error("Notification ID is undefined!");
        setError("Invalid notification ID.");
        return;
      }

      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://127.0.0.1:8000"
          : "https://pcp-backend-f4a2.onrender.com";
      const deleteUrl = `${API_BASE_URL}/api/deletenotification/${notifId}/`;
      console.log("DELETE URL:", deleteUrl);

      await axios.delete(deleteUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError(err.response?.data?.error || "Failed to delete notification.");
    }
  };

  // Delete all notifications
  const handleRemoveAll = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Loop through each notification delete call
      await Promise.all(
        notifications.map((notif) =>
          axios.delete(`${API_BASE_URL}/api/deletenotification/${notif.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setNotifications([]);
      setError(null);
    } catch (err) {
      console.error("Error deleting all notifications:", err);
      setError(err.response?.data?.error || "Failed to delete all notifications.");
    }
  };

  const toggleExpand = (notifId) => {
    setExpanded((prev) => ({
      ...prev,
      [notifId]: !prev[notifId],
    }));
  };

  if (!isOpen) return null;

  // Modal positioning
  const modalWidth = 300;
  const viewportWidth = window.innerWidth;
  const rightSpace = viewportWidth - buttonPosition.left - buttonPosition.width;
  const isRightPlacement = rightSpace >= modalWidth;
  const offsetX = isRightPlacement ? buttonPosition.width : -modalWidth;

  const modalStyle = {
    position: "absolute",
    top: `${buttonPosition.top - buttonPosition.height}px`,
    left: `${buttonPosition.left + offsetX}px`,
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={modalStyle}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Notifications ({notifications.length})</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && <p className={styles.errorMessage}>{error}</p>}

          {notifications.length > 0 ? (
            <>
              <ul className={styles.notificationList}>
                {notifications.map((notif, index) => (
                  <li key={notif.id || index} className={styles.notificationItem}>
                    <div
                      className={styles.notificationHeader}
                      onClick={() => toggleExpand(notif.id || index)}
                    >
                      <div className={styles.notificationTitleSection}>
                        <span className={styles.notificationTitle}>
                          {notif.title?.length > 50
                            ? `${notif.title.substring(0, 50)}...`
                            : notif.title || "Untitled"}
                        </span>

                        <span
                          className={styles.removeLink}
                          onClick={(e) => handleRemove(notif.id, e)}
                        >
                          (remove)
                        </span>
                      </div>

                      <FontAwesomeIcon
                        icon={expanded[notif.id || index] ? faChevronDown : faChevronRight}
                        className={styles.expandIcon}
                      />
                    </div>

                    <div className={styles.notificationTime}>{notif.time_sent}</div>

                    {expanded[notif.id || index] && (
                      <div className={styles.notificationMessageFull}>
                        {notif.message}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* Remove All button */}
              <div className={styles.removeAllContainer}>
                <button className={styles.removeAllButton} onClick={handleRemoveAll}>
                  Remove All
                </button>
              </div>
            </>
          ) : (
            <p className={styles.noNotifications}>No new notifications</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
