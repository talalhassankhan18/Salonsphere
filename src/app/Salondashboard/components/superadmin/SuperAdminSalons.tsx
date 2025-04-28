"use client"
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { PlusCircle, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Badge } from '../../components/ui/badge';

type Salon = {
  _id: string;
  name: string;
  city: string;
  active: boolean;
  adminName: string;
  revenue: number;
  createdAt: Date;
};

const SuperAdminSalons: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock salon data - in a real application, this would come from an API
  const salons: Salon[] = [
    { _id: "1", name: "Elegance Beauty Salon", city: "New York", active: true, adminName: "Emily Johnson", revenue: 24680, createdAt: new Date('2023-01-15') },
    { _id: "2", name: "Modern Cuts", city: "Los Angeles", active: true, adminName: "Michael Brown", revenue: 18950, createdAt: new Date('2023-02-20') },
    { _id: "3", name: "Golden Scissors", city: "Chicago", active: false, adminName: "David Wilson", revenue: 12340, createdAt: new Date('2023-03-10') },
    { _id: "4", name: "Glamour Studio", city: "Miami", active: true, adminName: "Sophia Martinez", revenue: 21560, createdAt: new Date('2023-03-25') },
    { _id: "5", name: "Urban Style", city: "Seattle", active: true, adminName: "James Taylor", revenue: 16780, createdAt: new Date('2023-04-05') },
  ];
  
  const filteredSalons = searchTerm 
    ? salons.filter(salon => 
        salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salon.adminName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : salons;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Salons</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Salon
        </Button>
      </div>
      
      <div className="flex items-center w-full max-w-sm space-x-2 mb-6">
        <Input
          type="text"
          placeholder="Search salons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Salon Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSalons.map((salon) => (
              <TableRow key={salon._id}>
                <TableCell className="font-medium">{salon.name}</TableCell>
                <TableCell>{salon.city}</TableCell>
                <TableCell>
                  <Badge variant={salon.active ? "default" : "destructive"}>
                    {salon.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{salon.adminName}</TableCell>
                <TableCell className="text-right">${salon.revenue.toLocaleString()}</TableCell>
                <TableCell>{salon.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
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

export default SuperAdminSalons;
