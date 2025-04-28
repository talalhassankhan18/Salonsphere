
import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardOverview from '../../components/dashboard/DashboardOverview';
import RecentActivitiesTable from '../../components/dashboard/RecentActivitiesTable';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <DashboardOverview />
        <RecentActivitiesTable />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
