import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faSearch, faSmile, faPaperclip, faPaperPlane, faEllipsisVertical
} from "@fortawesome/free-solid-svg-icons";
import Picker from "emoji-picker-react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import styles from "./ChatWindow.module.css";
import axios from "axios"

const ChatWindow = ({ onClose }) => {
  const { projectId } = useParams();
  const navigate = useNavigate(); // Added navigate hook
  const [messages, setMessages] = useState([]);
  const [projectName, setProjectName] = useState("Loading...");
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch project name + old messages
  useEffect(() => {
    const token = localStorage.getItem("access_token"); 
    const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://127.0.0.1:8000"
          : "https://pcp-backend-f4a2.onrender.com";

        axios
        .get(`${API_BASE_URL}/api/projects/${projectId}/chats/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.length > 0) {
            const chat = res.data[0]; // first chat for project
            setProjectName(chat.project_name || "Project");

            // Load past messages
            return axios.get(`${API_BASE_URL}/api/chats/${chat.pc_id}/messages/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } else {
            setProjectName("Project");
            setMessages([]);
          }
        })
        .then((res) => {
          if (res) setMessages(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch chat/messages: ", err);
          setMessages([]);
        });

        // WebSocket (won’t work until Channels is set up)
        const socketUrl =
        window.location.hostname === "localhost"
          ? `ws://127.0.0.1:8000/ws/chat/${projectId}/`
          : `wss://pcp-backend-f4a2.onrender.com/ws/chat/${projectId}/`;

        ws.current = new WebSocket(socketUrl);

        ws.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
        };

        return () => {
        if (ws.current) ws.current.close();
        };
  }, [projectId]);

  // Send a message
  const handleSendMessage = () => {
    if (newMessage.trim() !== "" && ws.current) {
      ws.current.send(
        JSON.stringify({
          content: newMessage,
          username: "You", // We may replace with actual authenticated user in the backend
        })
      );

      setNewMessage("");
      setShowEmojiPicker(false);
    }
  };

  // Press Enter to send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle back button click - navigate to dashboard
  const handleBackClick = () => {
    navigate("/dashboard"); // Navigate to dashboard
  };

  return (
    <div className={styles.chatWindow}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.iconBtn} 
            onClick={handleBackClick} // Updated to use navigate
            title="Back to Dashboard" // Added title
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className={styles.groupInfo}>
            <h3>{projectName}</h3>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconBtn} title="Search Messages">
            <FontAwesomeIcon icon={faSearch} />
          </button>
          <button className={styles.iconBtn} title="More Options">
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.dayDivider}>
          <span>Today</span>
        </div>

        {messages.length === 0 ? (
          <div className={styles.noMessages}>
            <p>Be the first to contact the team</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${styles.messageRow} ${
                msg.user === "You" ? styles.ownMessage : 
                ""}`}
            >
              <div className={styles.avatar}>
                {msg.username.charAt(0).toUpperCase()}
              </div>
              <div className={styles.messageContainer}>
                <div className={styles.messageHeader}>
                  <span className={styles.username}>{msg.username}</span>
                  <span className={styles.time}>
                    {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"})}
                  </span>
                </div>
                <div className={styles.messageBubble}>
                  <p>{msg.content}</p>
                </div>
                {msg.username === "You" && (
                  <div className={styles.messageStatus}>
                    <span className={styles.statusText}>{msg.status}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <button
          className={styles.iconBtn} 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Emojis" // Added title
        >
          <FontAwesomeIcon icon={faSmile} />
        </button>
        {showEmojiPicker && (
          <div className={styles.emojiPicker}>
            <Picker 
              onEmojiClick={(emojiData) => 
                setNewMessage((prev) => prev + emojiData.emoji)
              } 
            />
          </div>
        )}

        <button className={styles.iconBtn} title="Upload File">
          <FontAwesomeIcon icon={faPaperclip} />
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
          title="Send Message" // Added title
        >
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </footer>
    </div>
  );
};

export default ChatWindow;