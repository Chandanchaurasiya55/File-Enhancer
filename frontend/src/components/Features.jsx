import React, { useEffect, useState } from 'react';
import '../styles/Features.css';

const Features = () => {
  const [visibleItems, setVisibleItems] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      const featureItems = document.querySelectorAll('.feature-item');
      featureItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setVisibleItems(prev => ({ ...prev, [index]: true }));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      number: '01',
      title: 'Cloud Infrastructure',
      description: 'Powered by enterprise-grade servers across 6 continents. Process 8K footage in real-time with zero latency.'
    },
    {
      number: '02',
      title: 'Military-Grade Security',
      description: 'End-to-end encryption, SOC 2 compliant, and GDPR certified. Your content remains yours, always.'
    },
    {
      number: '03',
      title: 'Batch Processing',
      description: 'Process hundreds of videos simultaneously. Automated workflows save you hours of manual work.'
    },
    {
      number: '04',
      title: 'API Integration',
      description: 'Seamlessly integrate our platform into your workflow. RESTful API with comprehensive documentation.'
    }
  ];

  return (
    <section className="features-showcase" id="features">
      <div className="section-title fade-in">
        <h2>Uncompromising Excellence</h2>
        <p>Every detail, every feature, meticulously crafted</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`feature-item ${visibleItems[index] ? 'visible' : ''}`}
          >
            <div className="feature-number">{feature.number}</div>
            <div className="feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
