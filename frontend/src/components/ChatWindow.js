import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faSearch, faSmile, faPaperclip, faPaperPlane, faEllipsisVertical, faUserGroup
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ChatWindow.module.css";

const ChatWindow = ({ onClose }) => {
  const [messages] = useState([
    {
      id: 1,
      user: "Kamo",
      text: "Hey team! I've completed the initial research for our project.",
      time: "10:30 AM",
      status: "sent",
      color: "#6c5ce7",
      role: "Developer"
    },
    {
      id: 2,
      user: "Makgopa",
      text: "Thanks Kamo. I updated the database schema as we discussed yesterday.",
      time: "10:42 AM",
      status: "delivered",
      color: "#00b894",
      role: "Database Admin"
    },
    {
      id: 3,
      user: "You",
      text: "Great work both! I'll review the changes and integrate the frontend components.",
      time: "10:45 AM",
      status: "seen",
      color: "#0984e3",
      role: "Team Lead"
    },
    {
      id: 4,
      user: "Rohann",
      text: "Please remember to submit your progress reports by Friday. The chat is looking productive!",
      time: "11:15 AM",
      status: "seen",
      color: "#e17055",
      role: "Supervisor"
    }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      // Send the message via WebSocket. To be implemented
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatWindow}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.iconBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className={styles.groupInfo}>
            <h3> PCP Development Project</h3>
            <div className={styles.groupMeta}>
              <span className={styles.members}>
                <FontAwesomeIcon icon={faUserGroup} /> 12 members
              </span>
              <span className={styles.online}>8 online</span>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconBtn}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
          <button className={styles.iconBtn}>
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.dayDivider}>
          <span>Today</span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.messageRow} ${msg.user === "You" ? styles.ownMessage : ""}`}>
            <div
              className={styles.avatar}
              style={{ backgroundColor: msg.color }}
            >
              {msg.user.charAt(0).toUpperCase()}
            </div>
            <div className={styles.messageContainer}>
              <div className={styles.messageHeader}>
                <span className={styles.username}>{msg.user}</span>
                <span className={styles.role}>{msg.role}</span>
                <span className={styles.time}>{msg.time}</span>
              </div>
              <div className={styles.messageBubble}>
                <p>{msg.text}</p>
              </div>
              {msg.user === "You" && (
                <div className={styles.messageStatus}>
                  <span className={styles.statusText}>{msg.status}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <button className={styles.iconBtn}>
          <FontAwesomeIcon icon={faPaperclip} />
        </button>
        <button className={styles.iconBtn}>
          <FontAwesomeIcon icon={faSmile} />
        </button>
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <button 
          className={styles.sendBtn} 
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </footer>
    </div>
  );
};

export default ChatWindow;