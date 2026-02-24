import React from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-subtitle">Premium Video Studio</div>
        <h2 className='hero-heading'>Transform Your Creative Vision</h2>
        <p className="hero-description">
          Experience the pinnacle of video processing. Where technology meets artistry, 
          and every frame tells a story worth preserving.
        </p>
        <div className="hero-cta">
          <button className="btn-primary" onClick={() => handleNavClick('/services')}>Start Creating</button>
          <button className="btn-secondary" onClick={() => handleNavClick('/studio')}>Explore Studio</button>
        </div>
      </div>
    </section>
  );
};

export default Home;
