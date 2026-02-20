import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { servicesData } from '../data/servicesData';
import '../styles/Services.css';

const Services = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const handleServiceClick = (serviceId) => {
    navigate(`/service/${serviceId}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const servicesSection = document.querySelector('.services');
      if (servicesSection) {
        const rect = servicesSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="services" id="services">
      <div className={`section-title ${visible ? 'fade-in' : ''}`}>
        <h2>Masterful Services</h2>
        <p>Every tool crafted with precision, designed for perfection</p>
      </div>

      <div className="services-grid">
        {servicesData.map((service, index) => (
          <div 
            key={service.id} 
            className={`service-card ${visible ? 'fade-in' : ''}`}
            onClick={() => handleServiceClick(service.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <a href="#" className="service-link" onClick={(e) => { e.preventDefault(); handleServiceClick(service.id); }}>Explore</a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
