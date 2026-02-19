import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalFiles: 0
    });

    useEffect(() => {
        // Fetch dashboard stats
        fetchStats();
    }, []);

    const fetchStats = async () => {
        // This would be replaced with actual API calls
        setStats({
            totalUsers: 0,
            totalAdmins: 0,
            totalFiles: 0
        });
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = '/admin/login';
    };

    return (
        <div className="dashboard-container admin-dashboard">
            <nav className="dashboard-nav admin-nav">
                <h1>Admin Panel</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <h1>Welcome, {user?.firstname} {user?.lastname}!</h1>
                    <p>Role: {user?.role}</p>
                    <p>Email: {user?.email}</p>
                </div>

                <div className="stats-section">
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <p className="stat-number">{stats.totalUsers}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Admins</h3>
                        <p className="stat-number">{stats.totalAdmins}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Files</h3>
                        <p className="stat-number">{stats.totalFiles}</p>
                    </div>
                </div>

                <div className="dashboard-cards">
                    <div className="card">
                        <h3>Manage Users</h3>
                        <p>View, edit, and manage user accounts</p>
                        <button onClick={() => window.location.href = '/admin/users'}>Go to Users</button>
                    </div>

                    <div className="card">
                        <h3>Manage Admins</h3>
                        <p>Manage admin accounts and permissions</p>
                        <button onClick={() => window.location.href = '/admin/admins'}>Go to Admins</button>
                    </div>

                    <div className="card">
                        <h3>View Reports</h3>
                        <p>View system reports and analytics</p>
                        <button onClick={() => window.location.href = '/admin/reports'}>View Reports</button>
                    </div>

                    <div className="card">
                        <h3>System Settings</h3>
                        <p>Configure system settings and preferences</p>
                        <button onClick={() => window.location.href = '/admin/settings'}>Go to Settings</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
