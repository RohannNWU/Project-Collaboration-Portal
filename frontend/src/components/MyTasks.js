import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MyTasks = () => {
    const [user, setUser] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() =>{
        if (location.state?.email) {
            setUser(location.state.email);
        }
    }, [navigate, location]);

    return (
        <div>
            <h1>Tasks for {user}</h1>
            <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
    );
};

export default MyTasks;