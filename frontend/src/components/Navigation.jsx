import React from "react";
import { useNavigate,Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import emojiIcon from "../assets/emoji.webp";
import "../styles/Navigation.css";

const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleLoginClick = () => {
    navigate("/user/login");
  };

  const handleDashboardClick = () => {
    if (user?.role === "admin" || user?.role === "superadmin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  };

  return (
    <nav className="nav">
      <div className="logo" onClick={() => navigate("/")}>
        BUIMB DIGITAL
      </div>

      <div className="nav-menu">
        <Link to="/" className="nav-link">
         Home
        </Link>
        <Link to="/services" className="nav-link">
          Services
        </Link>
        <Link to="/features" className="nav-link">
          Features
        </Link>
        <Link to="/pricing" className="nav-link">
          Pricing
        </Link>
        <Link to="/Studio" className="nav-link">
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
