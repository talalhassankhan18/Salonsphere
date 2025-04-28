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
import { PlusCircle, Search, Edit, Trash2, UserCog } from 'lucide-react';
import { Badge } from '../ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type User = {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'salon_admin' | 'customer';
  salonName?: string;
  createdAt: Date;
  lastLogin?: Date;
};

const SuperAdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Mock data - in a real application, this would come from an API
  const users: User[] = [
    { _id: "1", name: "Admin User", email: "admin@example.com", role: "admin", createdAt: new Date('2022-12-01'), lastLogin: new Date('2023-04-28') },
    { _id: "2", name: "Emily Johnson", email: "emily@salon.com", role: "salon_admin", salonName: "Elegance Beauty Salon", createdAt: new Date('2023-01-15'), lastLogin: new Date('2023-04-27') },
    { _id: "3", name: "Michael Brown", email: "michael@salon.com", role: "salon_admin", salonName: "Modern Cuts", createdAt: new Date('2023-02-20'), lastLogin: new Date('2023-04-25') },
    { _id: "4", name: "Sarah Thompson", email: "sarah@example.com", role: "customer", createdAt: new Date('2023-02-25'), lastLogin: new Date('2023-04-26') },
    { _id: "5", name: "David Wilson", email: "david@salon.com", role: "salon_admin", salonName: "Golden Scissors", createdAt: new Date('2023-03-10') },
    { _id: "6", name: "Jessica Miller", email: "jessica@example.com", role: "customer", createdAt: new Date('2023-03-15'), lastLogin: new Date('2023-04-20') },
    { _id: "7", name: "Robert Davis", email: "robert@example.com", role: "customer", createdAt: new Date('2023-03-28'), lastLogin: new Date('2023-04-22') },
    { _id: "8", name: "Super Admin", email: "superadmin@system.com", role: "super_admin", createdAt: new Date('2022-01-01'), lastLogin: new Date('2023-04-28') },
  ];
  
  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.salonName && user.salonName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="salon_admin">Salon Admin</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Salon</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={
                    user.role === "super_admin" 
                      ? "default" 
                      : user.role === "admin" 
                        ? "outline"
                        : user.role === "salon_admin"
                          ? "secondary"
                          : "default"
                  }>
                    {user.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{user.salonName || "-"}</TableCell>
                <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
                <TableCell>{user.lastLogin ? user.lastLogin.toLocaleDateString() : "Never"}</TableCell>
                <TableCell>
                  <div className="flex justify-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <UserCog className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled={user.role === "super_admin"}>
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

export default SuperAdminUsers;
