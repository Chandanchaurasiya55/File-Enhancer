import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import emojiIcon from '../assets/emoji.png';
import '../styles/Navigation.css';

const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleNavClick = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginClick = () => {
    navigate('/user/login');
  };


  const handleDashboardClick = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/dashboard');
    }
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
          <div className="user-menu">
            <span className="nav-user">Welcome, {user?.Fullname || user?.firstname}</span>
            <button
              className="emoji-btn"
              onClick={handleDashboardClick}
              title="Go to Dashboard"
            >
              <img src={emojiIcon} alt="Dashboard" className="emoji-icon" />
            </button>
          </div>
        ) : (
          <>
            <button className="btn-premium" onClick={handleLoginClick}>Get Started</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
