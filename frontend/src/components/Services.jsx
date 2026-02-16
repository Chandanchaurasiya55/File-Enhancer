import React, { useEffect, useState } from 'react';
import '../styles/Services.css';

const Services = () => {
  const [visible, setVisible] = useState(false);

  const handleNavClick = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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

  const services = [
    {
      icon: '🎬',
      title: 'Video Compression',
      description: 'Reduce file sizes by up to 95% without sacrificing visual fidelity. Our advanced algorithms preserve every detail that matters.'
    },
    {
      icon: '✨',
      title: 'AI Enhancement',
      description: 'Elevate your footage with neural network-powered upscaling, noise reduction, and color grading that rivals professional studios.'
    },
    {
      icon: '📈',
      title: 'Up Scaler',
      description: 'Transform your videos to higher resolutions with AI-powered upscaling. Enlarge 720p to 4K with stunning clarity and detail preservation.'
    },
    {
      icon: '⚡',
      title: 'Format Conversion',
      description: 'Seamlessly convert between any video format. Lightning-fast processing with zero quality loss.'
    },
    {
      icon: '🎭',
      title: 'Effects & Transitions',
      description: 'Hollywood-quality visual effects and transitions. Make every cut, every transition a work of art.'
    },
    {
      icon: '🚫',
      title: 'Water Mark Removal',
      description: 'Remove unwanted watermarks and logos from your videos effortlessly. Advanced AI technology detects and erases watermarks while preserving the background.'
    }
  ];

  return (
    <section className="services" id="services">
      <div className={`section-title ${visible ? 'fade-in' : ''}`}>
        <h2>Masterful Services</h2>
        <p>Every tool crafted with precision, designed for perfection</p>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div 
            key={index} 
            className={`service-card ${visible ? 'fade-in' : ''}`}
            onClick={() => handleNavClick('#upload')}
            style={{ cursor: 'pointer' }}
          >
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <a href="#" className="service-link" onClick={(e) => { e.preventDefault(); handleNavClick('#upload'); }}>Explore</a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
