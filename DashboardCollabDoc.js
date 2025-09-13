import React, { useState } from 'react';
import TaskCard from './TaskCard';
import UploadForm from './UploadForm';

const Dashboard = () => {
  const [role, setRole] = useState('student'); // 'student', 'leader', 'supervisor'
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Research Phase', assignedTo: 'student1', completed: false, sharepoint: false },
    { id: 2, title: 'Design Document', assignedTo: 'student2', completed: false, sharepoint: true },
  ]);

  const handleComplete = (taskId) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: true } : task));
  };

  return (
    <div className="dashboard">
      <div className="role-selector">
        <label>Select Role: </label>
        <select onChange={(e) => setRole(e.target.value)} value={role}>
          <option value="student">Student</option>
          <option value="leader">Group Leader</option>
          <option value="supervisor">Supervisor</option>
        </select>
      </div>

      <div className="task-list">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} role={role} onComplete={handleComplete} />
        ))}
      </div>

      {role === 'student' && <UploadForm />}
    </div>
  );
};

export default Dashboard;
