import React from 'react';
import '../styles/Home.css';

const Home = () => {
  const handleNavClick = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
          <button className="btn-primary" onClick={() => handleNavClick('#services')}>Start Creating</button>
          <button className="btn-secondary" onClick={() => handleNavClick('#features')}>Explore Studio</button>
        </div>
      </div>
    </section>
  );
};

export default Home;
