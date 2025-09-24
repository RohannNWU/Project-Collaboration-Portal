import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const MyTasks = () => {
    const [user, setUser] = useState('');
    const [email, setEmail] = useState('');
    const [tasks, setTasks] = useState([]);
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://127.0.0.1:8000'
        : 'https://pcp-backend-f4a2.onrender.com';

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        setEmail(location.state?.email || '');
        setUser(location.state?.username || '');

        const getTasks = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/gettasks/`,
                    { headers: { Authorization: `Bearer ${token}` } });
                setTasks(response.data.tasks || []);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setMessage('Failed to fetch tasks');
                setTasks([]);
            }
        };
        getTasks();
    }, [navigate, location, user, email, API_BASE_URL]);

    const updateTask = async (taskId, dueDate, priority, completed) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/updatetask/`, {
                task_id: taskId,
                task_due_date: dueDate,
                task_status: completed ? 'Completed' : 'In progress',
                task_priority: priority
            });
            setMessage(response.data.message || 'Task updated successfully');
        } catch (error) {
            console.error('Error updating task:', error);
            setMessage('Failed to update task');
        }
    }

    return (
        <div>
            <h1>Tasks for {user}</h1>
            <small>{email}</small>
            <table>
                {tasks.map((task, index) => (
                    <td key={index}><br /><strong>{task.task_id}. {task.task_name}</strong> <br /><strong>Due Date:</strong> {task.task_due_date} <br /><strong>Status:</strong> {task.task_status} <br /><strong>Priority:</strong> {task.task_priority} <br /><strong>Description:</strong> {task.task_description} <br /><strong>Project:</strong> {task.project_name}
                        <br />Mark as Completed<input id={`completed-${index}`} type="checkbox" />
                        <br /><label>Change Priority:<br /><select id={`priority-${index}`} name="priority"><option>Low</option><option>Medium</option><option>High</option></select></label>
                        <br /><label>Change Due Date:</label>
                        <input type="date" id={`due-date-${index}`} name="due-date" />
                        <br /><button onClick={() => updateTask(task.task_id, document.getElementById(`due-date-${index}`).value, document.getElementById(`priority-${index}`).value, document.getElementById(`completed-${index}`).checked)}>Update Task</button>
                        <br /><br />
                    </td>
                ))}
            </table>
            {message && <p>{message}</p>}
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
    );
};

export default MyTasks;