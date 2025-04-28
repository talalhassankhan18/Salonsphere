"use client"
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Eye, TruckIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Order = {
  _id: string;
  salonName: string;
  customerName: string;
  products: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: Date;
};

const SuperAdminOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Mock data - in a real application, this would come from an API
  const orders: Order[] = [
    { _id: "1", salonName: "Elegance Beauty Salon", customerName: "Sarah Johnson", products: 3, totalAmount: 89.97, status: "delivered", paymentStatus: "paid", createdAt: new Date('2023-04-20') },
    { _id: "2", salonName: "Modern Cuts", customerName: "Robert Davis", products: 1, totalAmount: 129.99, status: "shipped", paymentStatus: "paid", createdAt: new Date('2023-04-22') },
    { _id: "3", salonName: "Golden Scissors", customerName: "Jennifer Lopez", products: 2, totalAmount: 45.98, status: "processing", paymentStatus: "paid", createdAt: new Date('2023-04-25') },
    { _id: "4", salonName: "Glamour Studio", customerName: "Michael Smith", products: 4, totalAmount: 112.96, status: "pending", paymentStatus: "pending", createdAt: new Date('2023-04-27') },
    { _id: "5", salonName: "Urban Style", customerName: "Emma Wilson", products: 2, totalAmount: 69.98, status: "cancelled", paymentStatus: "refunded", createdAt: new Date('2023-04-18') },
    { _id: "6", salonName: "Elegance Beauty Salon", customerName: "David Brown", products: 1, totalAmount: 49.99, status: "delivered", paymentStatus: "paid", createdAt: new Date('2023-04-15') },
    { _id: "7", salonName: "Modern Cuts", customerName: "Sophia Martinez", products: 3, totalAmount: 94.97, status: "delivered", paymentStatus: "paid", createdAt: new Date('2023-04-12') },
  ];
  
  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.salonName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order._id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered": return "default";
      case "shipped": return "secondary";
      case "processing": return "outline";
      case "pending": return "warning";
      case "cancelled": return "destructive";
      default: return "default";
    }
  };
  
  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid": return "success";
      case "pending": return "warning";
      case "refunded": return "destructive";
      default: return "default";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Orders</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Salon</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">#{order._id}</TableCell>
                <TableCell>{order.salonName}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="text-center">{order.products}</TableCell>
                <TableCell className="text-right">${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status) as any}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus) as any}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled={order.status === "cancelled"}>
                      <TruckIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SuperAdminOrders;
