import React from 'react';

const TaskCard = ({ task, role, onComplete }) => {
  return (
    <div className={`task-card ${task.completed ? 'completed' : ''}`}>
      <h3>{task.title}</h3>
      <p>Assigned To: {task.assignedTo}</p>
      <p>Mode: {task.sharepoint ? 'SharePoint' : 'Individual Upload'}</p>

      {role === 'student' && !task.completed && (
        <button onClick={() => onComplete(task.id)}>Mark as Completed</button>
      )}

      {role === 'leader' && task.completed && (
        <button>Approve Completion</button>
      )}

      {role === 'supervisor' && task.completed && (
        <button>Grade / Comment</button>
      )}
    </div>
  );
};

export default TaskCard;
