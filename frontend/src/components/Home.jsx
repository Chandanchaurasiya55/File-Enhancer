import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <div className="hero-subtitle">Premium Video Studio</div>
        <h2 className="hero-heading">Transform Your Creative Vision</h2>
        <p className="hero-description">
          Turn imagination into creation From powerful video processing to
          AI-driven document generation — everything you need to create,
          enhance, and share without limits.
        </p>
        <div className="hero-cta">
          <button
            className="btn-primary"
            onClick={() => handleNavClick("/services")}
          >
            Start Creating
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleNavClick("/studio")}
          >
            Explore Studio
          </button>
        </div>
      </div>
    </section>
  );
};

export default Home;
