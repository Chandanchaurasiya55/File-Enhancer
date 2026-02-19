import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleNavClick = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginClick = () => {
    navigate('/user/login');
  };

  const handleSignupClick = () => {
    navigate('/user/signup');
  };

  const handleDashboardClick = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="nav">
      <div className="logo">BUIMB DIGITAL</div>
      <div className="nav-menu">
        <a href="#services" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('#services'); }}>Services</a>
        <a href="#features" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('#features'); }}>Features</a>
        <a href="#pricing" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('#pricing'); }}>Pricing</a>
        <a href="#studio" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('#upload'); }}>Studio</a>

        {isAuthenticated ? (
          <>
            <span className="nav-user">Welcome, {user?.firstname}</span>
            <button className="btn-login" onClick={handleDashboardClick}>Dashboard</button>
            <button className="btn-premium" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn-login" onClick={handleLoginClick}>Login</button>
            <button className="btn-premium" onClick={handleSignupClick}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
