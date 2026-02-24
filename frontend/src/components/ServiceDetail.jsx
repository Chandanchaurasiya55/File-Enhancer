import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Upload from './Upload';
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
      <div className="service-detail-container">
        <div className="service-detail-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div className="service-icon-large">{service.icon}</div>
            <h1>{service.title}</h1>
          </div>
          <div className="service-detail-description">
            <p>{service.fullDescription}</p>
          </div>
        </div>

        <div className="service-details-grid">
          <div className="upload-column">
            <Upload serviceId={service.id} operation={service.operation} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetail;
