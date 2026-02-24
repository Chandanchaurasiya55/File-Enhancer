import React, { useEffect, useState } from 'react';
import '../styles/Pricing.css';

const Pricing = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const pricingSection = document.querySelector('.pricing');
      if (pricingSection) {
        const rect = pricingSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const plans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      description: 'Perfect for beginners',
      features: [
        '5GB storage per month',
        'Basic video compression',
        '480p to 1080p quality',
        'Support for all formats',
        'Email support'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'For serious creators',
      features: [
        '50GB storage per month',
        '4K video processing',
        'AI Enhancement & Upscaling',
        'Watermark removal',
        'Priority support',
        'Batch processing',
        'No ads'
      ],
      cta: 'Get Started',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For studios & teams',
      features: [
        '500GB storage per month',
        '8K video processing',
        'All Professional features',
        'Advanced effects & transitions',
        '24/7 phone support',
        'Unlimited batch processing',
        'Custom API access',
        'Team collaboration'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <section className="pricing" id="pricing">
      <div className={`section-title ${visible ? 'fade-in' : ''}`}>
        <h2>Transparent Pricing</h2>
        <p>Choose the plan that fits your creative needs</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`pricing-card ${plan.popular ? 'popular' : ''} ${visible ? 'fade-in' : ''}`}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            <h3>{plan.name}</h3>
            <p className="plan-description">{plan.description}</p>
            <div className="price">
              <span className="amount">{plan.price}</span>
              <span className="period">{plan.period}</span>
            </div>
            <button className={`plan-btn ${plan.popular ? 'popular-btn' : ''}`}>
              {plan.cta}
            </button>
            <div className="divider"></div>
            <ul className="features-list">
              {plan.features.map((feature, idx) => (
                <li key={idx}>
                  <span className="check-icon">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

     
    </section>
  );
};

export default Pricing;
