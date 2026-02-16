import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <div className="footer-brand">BUIMB DIGITAL</div>
          <p className="footer-desc">
            The professional's choice for video processing. 
            Trusted by filmmakers, content creators, and studios worldwide.
          </p>
          <div className="social-links">
            <a href="#">📷</a>
            <a href="#">🐦</a>
            <a href="#">▶️</a>
            <a href="#">💼</a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Platform</h4>
          <ul>
            <li><a href="#">Features</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">API Docs</a></li>
            <li><a href="#">Changelog</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Press Kit</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Tutorials</a></li>
            <li><a href="#">Community</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 BUIMB DIGITAL. Crafted with passion for creators worldwide.</p>
      </div>
    </footer>
  );
};

export default Footer;
