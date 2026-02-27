import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import emojiIcon from "../assets/emoji.webp";
import "../styles/Navigation.css";


const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLoginClick = () => {
    navigate("/user/login");
    setMenuOpen(false);
  };

  const handleDashboardClick = () => {
    if (user?.role === "admin" || user?.role === "superadmin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/user/dashboard");
    }
    setMenuOpen(false);
  };

  const handleHamburgerClick = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className="nav">
      <div className="logo" onClick={() => navigate("/")}>BUIMB DIGITAL</div>

      <button className="nav-hamburger" onClick={handleHamburgerClick} aria-label="Toggle menu">
        <span className={menuOpen ? "bar open" : "bar"}></span>
        <span className={menuOpen ? "bar open" : "bar"}></span>
        <span className={menuOpen ? "bar open" : "bar"}></span>
      </button>

      <div className={menuOpen ? "nav-menu nav-menu-open" : "nav-menu"}>
        <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link to="/services" className="nav-link" onClick={() => setMenuOpen(false)}>
          Services
        </Link>
        <Link to="/features" className="nav-link" onClick={() => setMenuOpen(false)}>
          Features
        </Link>
        <Link to="/pricing" className="nav-link" onClick={() => setMenuOpen(false)}>
          Pricing
        </Link>
        <Link to="/Studio" className="nav-link" onClick={() => setMenuOpen(false)}>
          Studio
        </Link>

        {isAuthenticated ? (
          <div className="user-menu">
            <button
              className="emoji-btn"
              onClick={handleDashboardClick}
              title="Go to Dashboard"
            >
              <img src={emojiIcon} alt="Dashboard" className="emoji-icon" />
            </button>
          </div>
        ) : (
          <button className="btn-premium" onClick={handleLoginClick}>
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
