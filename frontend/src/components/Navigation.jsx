import React from 'react';
import '../styles/Navigation.css';

const Navigation = () => {
  const handleNavClick = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
        <button className="btn-login">Login</button>
        <button className="btn-premium" onClick={() => handleNavClick('#upload')}>Get Started</button>
      </div>
    </nav>
  );
};

export default Navigation;
