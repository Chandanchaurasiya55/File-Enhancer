import React from 'react';
import '../styles/Stats.css';

const Stats = () => {
  const stats = [
    { number: '2M+', label: 'Videos Processed' },
    { number: '150K', label: 'Active Creators' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <section className="stats" id="stats">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <div className="stat-number">{stat.number}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
