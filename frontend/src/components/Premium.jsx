import React, { useEffect, useState } from 'react';
import '../styles/Premium.css';
import premiumImg from '../assets/premium@2x.webp';

const Premium = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector('.premium-section');
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetPremium = () => {
    const element = document.querySelector('#pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const benefits = [
    'Get full access to all features and work offline with Desktop',
    'Edit videos, get advanced AI enhancement and request secure processing',
    'Connect tools and create custom workflows'
  ];

  return (
    <section className="premium-section" id="premium">
      <div className="premium-bg-decoration premium-decoration-1"></div>
      <div className="premium-bg-decoration premium-decoration-2"></div>
      <div className="premium-bg-decoration premium-decoration-3"></div>
      
      <div className="premium-container">
        <div className="premium-content">
          <div className={`premium-badge ${isVisible ? 'slide-in' : ''}`}>
            <span className="star-icon">✨</span> EXCLUSIVE OFFER
          </div>
          
          <h2 className={`premium-title ${isVisible ? 'fade-in-up' : ''}`}>
            Get more with Premium
          </h2>
          
          <div className="premium-benefits">
            {benefits.map((benefit, index) => (
              <div key={index} className={`benefit-item ${isVisible ? 'fade-in-up' : ''}`} style={{ transitionDelay: `${index * 0.1}s` }}>
                <div className="benefit-checkmark">✓</div>
                <p>{benefit}</p>
              </div>
            ))}
          </div>

          <button className="premium-btn" onClick={handleGetPremium}>
            <span className="crown-icon">👑</span>
            <h3 className="crown-btn-text">Unlock Premium Now</h3>
            <span className="btn-arrow">→</span>
          </button>
        </div>

        <div className={`premium-image ${isVisible ? 'fade-in' : ''}`}>
          <div className="image-frame">
            <img src={premiumImg} alt="Premium Features" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Premium;
