
import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ServicesList from '../../components/services/ServicesList';
import { generateMockServices } from '../../models/types';

const Services: React.FC = () => {
  const services = generateMockServices();

  return (
    <DashboardLayout title="Services">
      <ServicesList services={services} />
    </DashboardLayout>
  );
};

export default Services;
