
import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import SuperAdminSalons from '../../components/superadmin/SuperAdminSalons';
import SuperAdminProducts from '../../components/superadmin/SuperAdminProducts';
import SuperAdminUsers from '../../components/superadmin/SuperAdminUsers';
import SuperAdminOrders from '../../components/superadmin/SuperAdminOrders';
import SuperAdminStats from '../../components/superadmin/SuperAdminStats';

const SuperAdminDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Super Admin Dashboard">
      <div className="p-6">
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="mb-6 grid grid-cols-5 gap-4">
            <TabsTrigger value="stats">Overview</TabsTrigger>
            <TabsTrigger value="salons">Salons</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats">
            <SuperAdminStats />
          </TabsContent>
          
          <TabsContent value="salons">
            <SuperAdminSalons />
          </TabsContent>
          
          <TabsContent value="products">
            <SuperAdminProducts />
          </TabsContent>
          
          <TabsContent value="users">
            <SuperAdminUsers />
          </TabsContent>
          
          <TabsContent value="orders">
            <SuperAdminOrders />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
