//----------------------------------------
// Chat Window Component (UI only)
//----------------------------------------
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSearch,
  faSmile,
  faPaperclip,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ChatWindow.module.css";

const ChatWindow = () => {
  const [messages] = useState([
    {
      id: 1,
      user: "Lerato",
      text: "Hey!",
      time: "3h ago",
      status: "sent",
      color: "#6c5ce7",
    },
    {
      id: 2,
      user: "Makgopa",
      text: "I updated the DB",
      time: "1h ago",
      status: "delivered",
      color: "#00b894",
    },
    {
      id: 3,
      user: "You",
      text: "Ok!",
      time: "just now",
      status: "seen",
      color: "#0984e3",
    },
  ]);

  return (
    <div className={styles.chatWindow}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.iconBtn}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div className={styles.groupInfo}>
          <h3>Group Project A</h3>
          <small>12 members · 8 online</small>
        </div>
        <button className={styles.iconBtn}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </header>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.dayDivider}>
          <span>Today</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={styles.messageRow}>
            <div
              className={styles.avatar}
              style={{ backgroundColor: msg.color }}
            >
              {msg.user.charAt(0).toUpperCase()}
            </div>
            <div className={styles.messageBubble}>
              <div className={styles.messageHeader}>
                <span className={styles.username}>{msg.user}</span>
              </div>
              <p>{msg.text}</p>
              <small className={styles.status}>{msg.status}
              <span className={styles.time}>{msg.time}</span>
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <button className={styles.iconBtn}>
          <FontAwesomeIcon icon={faSmile} />
        </button>
        <button className={styles.iconBtn}>
          <FontAwesomeIcon icon={faPaperclip} />
        </button>
        <input
          type="text"
          className={styles.input}
          placeholder="Enter a message"
        />
        <button className={styles.sendBtn}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </footer>
    </div>
  );
};

export default ChatWindow;
