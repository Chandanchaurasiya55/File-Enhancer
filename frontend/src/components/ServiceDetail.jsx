import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import Upload from './Upload';
import Footer from './Footer';
import { servicesData } from '../data/servicesData';
import '../styles/ServiceDetail.css';

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const service = servicesData.find(s => s.id === serviceId);

  useEffect(() => {
    if (!service) {
      navigate('/');
    }
  }, [service, navigate]);

  if (!service) {
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="service-detail-container">
        <div className="service-detail-header">
          <div className="service-icon-large">{service.icon}</div>
          <h1>{service.title}</h1>
          <div className="service-detail-description">
            <p>{service.fullDescription}</p>
          </div>
        </div>

        <div className="service-details-grid">
          <div className="upload-column">
            <Upload hideSelector={true} serviceId={service.id} operation={service.operation} />
          </div>
        </div>

        {/* features & benefits now sit below upload in a horizontal row */}
        <div className="features-benefits-row">
          <div className="details-section">
            <h3>✨ Features</h3>
            <ul className="features-list">
              {service.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="details-section">
            <h3>🎯 Benefits</h3>
            <ul className="benefits-list">
              {service.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ServiceDetail;
