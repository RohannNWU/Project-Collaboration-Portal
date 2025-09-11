import React, { useState } from 'react';
import './collaborativeDocumentation.css'; // Make sure this CSS file includes NWU purple styling

const CollaborativeDocumentation = () => {
  const [mode, setMode] = useState('upload'); // 'upload' or 'sharepoint'
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [documents, setDocuments] = useState({});
  const [completedTasks, setCompletedTasks] = useState([]);

  const handleModeChange = (e) => setMode(e.target.value);

  const handleTaskSelection = (taskId) => setSelectedTask(taskId);

  const handleDocumentUpload = (taskId, file) => {
    setDocuments((prev) => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), file],
    }));
  };

  const markTaskComplete = (taskId) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
      alert(`Task ${taskId} marked complete. Group leader notified.`);
    }
  };

  return (
    <div className="collab-doc-container nwu-theme">
      <h2 className="nwu-heading">Collaborative Documentation Portal</h2>

      {/* Mode Selection */}
      <div className="mode-selector">
        <label className="nwu-label">Document Submission Mode:</label>
        <select value={mode} onChange={handleModeChange} className="nwu-select">
          <option value="upload">Individual Task Uploads</option>
          <option value="sharepoint">SharePoint Collaboration</option>
        </select>
      </div>

      {/* Task Dashboard */}
      <div className="task-dashboard">
        <h3 className="nwu-subheading">Your Assigned Tasks</h3>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <button className="nwu-button" onClick={() => handleTaskSelection(task.id)}>
                {task.title}
              </button>
              {completedTasks.includes(task.id) && <span className="nwu-status">✅ Completed</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Task Details */}
      {selectedTask && (
        <div className="task-details">
          <h4 className="nwu-subheading">Task: {tasks.find((t) => t.id === selectedTask)?.title}</h4>

          {mode === 'upload' ? (
            <div className="upload-section">
              <input
                type="file"
                className="nwu-input"
                onChange={(e) =>
                  handleDocumentUpload(selectedTask, e.target.files[0])
                }
              />
              <button className="nwu-button success" onClick={() => markTaskComplete(selectedTask)}>
                Mark as Complete
              </button>
            </div>
          ) : (
            <div className="sharepoint-section">
              <label className="nwu-label">SharePoint Link:</label>
              <input type="url" className="nwu-input" placeholder="Paste SharePoint URL here" />
              <button className="nwu-button success" onClick={() => markTaskComplete(selectedTask)}>
                Mark as Complete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Group Leader & Supervisor View */}
      <div className="overview-section">
        <h3 className="nwu-subheading">Document Overview</h3>
        <ul>
          {Object.entries(documents).map(([taskId, files]) => (
            <li key={taskId}>
              <strong>Task {taskId}:</strong>
              <ul>
                {files.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <button className="nwu-button final" onClick={() => alert('Final document submitted.')}>
          Submit Final Document
        </button>
      </div>
    </div>
  );
};

export default CollaborativeDocumentation;
