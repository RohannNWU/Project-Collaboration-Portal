import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewProject = () => {
    const [email, setEmail] = useState('');
    const [projectname, setProjectname] = useState('');
    const [project_description, setProjectDescription] = useState('');
    const [project_due_date, setProjectDueDate] = useState('');
    const [memberName, setMemberName] = useState('');
    const [project_members, setProjectMembers] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();   

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/');
            return;
        }
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';
        axios.get(`${API_BASE_URL}/api/dashboard/`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setEmail(response.data.email);
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    setMessage('Invalid credentials');
                    navigate('/');
                }
            });
    }, [navigate]);

    const handleInputChange = (event) => {
        setMemberName(event.target.value);
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        if (memberName.trim()) {
            setProjectMembers([...project_members, memberName]);
            setMemberName('');   
        }
    }

    const createNewProject = async () => {
        project_members.push(email);
        const API_BASE_URL = window.location.hostname === 'localhost'
            ? 'http://127.0.0.1:8000'
            : 'https://pcp-backend-f4a2.onrender.com';
        
        const response = await axios.post(
            `${API_BASE_URL}/api/newproject/`,
            {
                project_name: projectname,
                project_description: project_description,
                project_due_date: project_due_date,
                project_members: project_members
            }
        );
        setMessage(response.data.message);
    }

    return(
        <div>
            <h1>New Project for {email}</h1>
            <form>
                <input
                    type="text"
                    placeholder="Project Name"
                    value={projectname}
                    onChange={(e) => setProjectname(e.target.value)}
                    required
                />
                <br />
                <textarea
                    type="text"
                    placeholder="Project Description"
                    value={project_description}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    required
                />
                <br />
                <input
                    type="date"
                    placeholder='Submission Date'
                    value={project_due_date}
                    onChange={(e) => setProjectDueDate(e.target.value)}
                    required
                />
                <br />
                <input
                    type="text"
                    placeholder="Project Member"
                    value={memberName}
                    onChange={handleInputChange}
                />
                <button onClick={handleAddMember}>
                    Add Member
                </button>
                <br />
                <textarea
                    type="text"
                    value={project_members.join('; \n')}
                    disabled
                    rows="8"
                />
                <br />
                <button type="submit" onClick={createNewProject}>Create Project</button>
                {message && <p>{message}</p>}
            </form>
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
    );
};

export default NewProject;