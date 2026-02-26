import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Dashboard.css';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <h1>File Enhancer</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <h1>Welcome, {user?.firstname} {user?.lastname}!</h1>
                    <p>Email: {user?.email}</p>
                    <p>Username: {user?.username}</p>
                </div>

                <div className="dashboard-cards">
                    <div className="card">
                        <h3>Upload Files</h3>
                        <p>Select files to enhance and convert</p>
                        <button onClick={() => window.location.href = '/upload'}>Go to Upload</button>
                    </div>

                    <div className="card">
                        <h3>My Files</h3>
                        <p>View and manage your uploaded files</p>
                        <button onClick={() => window.location.href = '/my-files'}>View Files</button>
                    </div>

                    <div className="card">
                        <h3>Profile Settings</h3>
                        <p>Update your profile information</p>
                        <button onClick={() => window.location.href = '/profile'}>Edit Profile</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
