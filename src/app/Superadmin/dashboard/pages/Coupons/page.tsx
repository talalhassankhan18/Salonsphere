'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/Superadmin/dashboard/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/Superadmin/dashboard/components/ui/tabs';
import { Button } from '@/app/Superadmin/dashboard/components/ui/button';
import { Input } from '@/app/Superadmin/dashboard/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/Superadmin/dashboard/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/Superadmin/dashboard/components/ui/dialog';
import { Label } from '@/app/Superadmin/dashboard/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/Superadmin/dashboard/components/ui/select';
import { toast } from '@/app/Superadmin/dashboard/components/ui/use-toast';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  BarChart,
  Copy,
  Tag,
  Calendar,
} from 'lucide-react';

interface ICoupon {
  _id: string;
  code: string;
  discount: string;
  type: 'Percentage' | 'Fixed Amount' | 'Shipping';
  minPurchase: number;
  limit: number;
  used: number;
  status: 'Active' | 'Expired';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

const CouponCard = ({
  coupon,
  onEdit,
  onDelete,
}: {
  coupon: ICoupon;
  onEdit: (coupon: ICoupon) => void;
  onDelete: (id: string) => void;
}) => (
  <Card className="h-full w-full max-w-md">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{coupon.code}</CardTitle>
      <CardDescription>{coupon.type}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-xs text-muted-foreground">
        <div className="flex justify-between mb-1">
          <span>Discount</span>
          <span>{coupon.discount}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Min Purchase</span>
          <span>${coupon.minPurchase}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Usage Limit</span>
          <span>{coupon.limit === 0 ? 'Unlimited' : coupon.limit}</span>
        </div>
        <div className="flex justify-between">
          <span>Status</span>
          <span>{coupon.status}</span>
        </div>
        <div className="flex justify-between">
          <span>Validity</span>
          <span>
            {new Date(coupon.startDate).toLocaleDateString()} -{' '}
            {new Date(coupon.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[80px]"
          onClick={() => onEdit(coupon)}
        >
          <Edit className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[80px]"
          onClick={() => onDelete(coupon._id)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Delete
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[80px]"
          onClick={() => {
            navigator.clipboard.writeText(coupon.code);
            toast({
              title: 'Success',
              description: `Copied ${coupon.code} to clipboard`,
            });
          }}
        >
          <Copy className="w-3.5 h-3.5 mr-1" />
          Copy
        </Button>
      </div>
    </CardContent>
  </Card>
);

const Coupons = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'Percentage' as ICoupon['type'],
    minPurchase: 0,
    limit: 0,
    startDate: '',
    endDate: '',
  });

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`/api/coupons?search=${searchTerm}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Coupon API endpoint not found. Please check the server configuration.');
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setCoupons(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch coupons');
      }
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch coupons. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [searchTerm]);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discount.trim() || !formData.startDate || !formData.endDate) {
      toast({
        title: 'Error',
        description: 'Coupon code, discount, start date, and end date are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const text = await response.text();
        if (response.status === 404) {
          throw new Error('Coupon API endpoint not found. Please check the server configuration.');
        }
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
      }
      const result = await response.json();
      if (result.success) {
        setIsAddModalOpen(false);
        setFormData({
          code: '',
          discount: '',
          type: 'Percentage',
          minPurchase: 0,
          limit: 0,
          startDate: '',
          endDate: '',
        });
        await fetchCoupons();
        toast({
          title: 'Success',
          description: 'Coupon added successfully',
        });
      } else {
        throw new Error(result.error || 'Failed to add coupon');
      }
    } catch (error: any) {
      console.error('Error adding coupon:', error);
      toast({
        title: 'Error',
        description: error.message.includes('Coupon code already exists')
          ? 'Coupon code already exists'
          : `Failed to add coupon: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleEditCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !formData.code.trim() || !formData.discount.trim() || !formData.startDate || !formData.endDate) {
      toast({
        title: 'Error',
        description: 'Coupon code, discount, start date, and end date are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/coupons/${editingCoupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const text = await response.text();
        if (response.status === 404) {
          throw new Error('Coupon API endpoint not found. Please check the server configuration.');
        }
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
      }
      const result = await response.json();
      if (result.success) {
        setEditingCoupon(null);
        setFormData({
          code: '',
          discount: '',
          type: 'Percentage',
          minPurchase: 0,
          limit: 0,
          startDate: '',
          endDate: '',
        });
        await fetchCoupons();
        toast({
          title: 'Success',
          description: 'Coupon updated successfully',
        });
      } else {
        throw new Error(result.error || 'Failed to update coupon');
      }
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      toast({
        title: 'Error',
        description: error.message.includes('Coupon code already exists')
          ? 'Coupon code already exists'
          : `Failed to update coupon: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const text = await response.text();
        if (response.status === 404) {
          throw new Error('Coupon API endpoint not found. Please check the server configuration.');
        }
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
      }
      const result = await response.json();
      if (result.success) {
        await fetchCoupons();
        toast({
          title: 'Success',
          description: 'Coupon deleted successfully',
        });
      } else {
        throw new Error(result.error || 'Failed to delete coupon');
      }
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast({
        title: 'Error',
        description: `Failed to delete coupon: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const filteredCoupons = coupons.filter(
    coupon =>
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">Manage discount coupons</p>
        </div>
        <Button className="sm:self-start" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      {(isAddModalOpen || editingCoupon) && (
        <Dialog
          open={isAddModalOpen || !!editingCoupon}
          onOpenChange={open => {
            if (!open) {
              setIsAddModalOpen(false);
              setEditingCoupon(null);
              setFormData({
                code: '',
                discount: '',
                type: 'Percentage',
                minPurchase: 0,
                limit: 0,
                startDate: '',
                endDate: '',
              });
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={editingCoupon ? handleEditCoupon : handleAddCoupon}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={value =>
                    setFormData({ ...formData, type: value as ICoupon['type'] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                    <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                    <SelectItem value="Shipping">Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="minPurchase">Minimum Purchase</Label>
                <Input
                  id="minPurchase"
                  type="number"
                  value={formData.minPurchase}
                  onChange={e =>
                    setFormData({ ...formData, minPurchase: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="limit">Usage Limit (0 for unlimited)</Label>
                <Input
                  id="limit"
                  type="number"
                  value={formData.limit}
                  onChange={e =>
                    setFormData({ ...formData, limit: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingCoupon ? 'Update' : 'Add'} Coupon
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCoupon(null);
                    setFormData({
                      code: '',
                      discount: '',
                      type: 'Percentage',
                      minPurchase: 0,
                      limit: 0,
                      startDate: '',
                      endDate: '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Coupons</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coupons..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>All Coupons</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8 w-8 p-0"
                  >
                    <BarChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                filteredCoupons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredCoupons.map(coupon => (
                      <CouponCard
                        key={coupon._id}
                        coupon={coupon}
                        onEdit={coupon => {
                          setEditingCoupon(coupon);
                          setFormData({
                            code: coupon.code,
                            discount: coupon.discount,
                            type: coupon.type,
                            minPurchase: coupon.minPurchase,
                            limit: coupon.limit,
                            startDate: new Date(coupon.startDate).toISOString().split('T')[0],
                            endDate: new Date(coupon.endDate).toISOString().split('T')[0],
                          });
                        }}
                        onDelete={handleDeleteCoupon}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No coupons found.</p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Min Purchase</TableHead>
                        <TableHead>Usage Limit</TableHead>
                        <TableHead>Used</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoupons.length > 0 ? (
                        filteredCoupons.map(coupon => (
                          <TableRow key={coupon._id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <Tag className="h-4 w-4 mr-2 text-primary" />
                                {coupon.code}
                              </div>
                            </TableCell>
                            <TableCell>{coupon.discount}</TableCell>
                            <TableCell>{coupon.type}</TableCell>
                            <TableCell>${coupon.minPurchase}</TableCell>
                            <TableCell>
                              {coupon.limit === 0 ? 'Unlimited' : coupon.limit}
                            </TableCell>
                            <TableCell>{coupon.used}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span className="text-xs">
                                  {new Date(coupon.startDate).toLocaleDateString()} -{' '}
                                  {new Date(coupon.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  coupon.status === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {coupon.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    navigator.clipboard.writeText(coupon.code);
                                    toast({
                                      title: 'Success',
                                      description: `Copied ${coupon.code} to clipboard`,
                                    });
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingCoupon(coupon);
                                    setFormData({
                                      code: coupon.code,
                                      discount: coupon.discount,
                                      type: coupon.type,
                                      minPurchase: coupon.minPurchase,
                                      limit: coupon.limit,
                                      startDate: new Date(coupon.startDate)
                                        .toISOString()
                                        .split('T')[0],
                                      endDate: new Date(coupon.endDate)
                                        .toISOString()
                                        .split('T')[0],
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCoupon(coupon._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center h-24">
                            No coupons found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Active Coupons</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8 w-8 p-0"
                  >
                    <BarChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                filteredCoupons.filter(coupon => coupon.status === 'Active').length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredCoupons
                      .filter(coupon => coupon.status === 'Active')
                      .map(coupon => (
                        <CouponCard
                          key={coupon._id}
                          coupon={coupon}
                          onEdit={coupon => {
                            setEditingCoupon(coupon);
                            setFormData({
                              code: coupon.code,
                              discount: coupon.discount,
                              type: coupon.type,
                              minPurchase: coupon.minPurchase,
                              limit: coupon.limit,
                              startDate: new Date(coupon.startDate).toISOString().split('T')[0],
                              endDate: new Date(coupon.endDate).toISOString().split('T')[0],
                            });
                          }}
                          onDelete={handleDeleteCoupon}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No active coupons found.</p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Min Purchase</TableHead>
                        <TableHead>Usage Limit</TableHead>
                        <TableHead>Used</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoupons.filter(coupon => coupon.status === 'Active').length > 0 ? (
                        filteredCoupons
                          .filter(coupon => coupon.status === 'Active')
                          .map(coupon => (
                            <TableRow key={coupon._id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Tag className="h-4 w-4 mr-2 text-primary" />
                                  {coupon.code}
                                </div>
                              </TableCell>
                              <TableCell>{coupon.discount}</TableCell>
                              <TableCell>{coupon.type}</TableCell>
                              <TableCell>${coupon.minPurchase}</TableCell>
                              <TableCell>
                                {coupon.limit === 0 ? 'Unlimited' : coupon.limit}
                              </TableCell>
                              <TableCell>{coupon.used}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  <span className="text-xs">
                                    {new Date(coupon.startDate).toLocaleDateString()} -{' '}
                                    {new Date(coupon.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    coupon.status === 'Active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {coupon.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      navigator.clipboard.writeText(coupon.code);
                                      toast({
                                        title: 'Success',
                                        description: `Copied ${coupon.code} to clipboard`,
                                      });
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingCoupon(coupon);
                                      setFormData({
                                        code: coupon.code,
                                        discount: coupon.discount,
                                        type: coupon.type,
                                        minPurchase: coupon.minPurchase,
                                        limit: coupon.limit,
                                        startDate: new Date(coupon.startDate)
                                          .toISOString()
                                          .split('T')[0],
                                        endDate: new Date(coupon.endDate)
                                          .toISOString()
                                          .split('T')[0],
                                      });
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCoupon(coupon._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center h-24">
                            No active coupons found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expired" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Expired Coupons</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8 w-8 p-0"
                  >
                    <BarChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                filteredCoupons.filter(coupon => coupon.status === 'Expired').length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredCoupons
                      .filter(coupon => coupon.status === 'Expired')
                      .map(coupon => (
                        <CouponCard
                          key={coupon._id}
                          coupon={coupon}
                          onEdit={coupon => {
                            setEditingCoupon(coupon);
                            setFormData({
                              code: coupon.code,
                              discount: coupon.discount,
                              type: coupon.type,
                              minPurchase: coupon.minPurchase,
                              limit: coupon.limit,
                              startDate: new Date(coupon.startDate).toISOString().split('T')[0],
                              endDate: new Date(coupon.endDate).toISOString().split('T')[0],
                            });
                          }}
                          onDelete={handleDeleteCoupon}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No expired coupons found.</p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Min Purchase</TableHead>
                        <TableHead>Usage Limit</TableHead>
                        <TableHead>Used</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoupons.filter(coupon => coupon.status === 'Expired').length > 0 ? (
                        filteredCoupons
                          .filter(coupon => coupon.status === 'Expired')
                          .map(coupon => (
                            <TableRow key={coupon._id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Tag className="h-4 w-4 mr-2 text-primary" />
                                  {coupon.code}
                                </div>
                              </TableCell>
                              <TableCell>{coupon.discount}</TableCell>
                              <TableCell>{coupon.type}</TableCell>
                              <TableCell>${coupon.minPurchase}</TableCell>
                              <TableCell>
                                {coupon.limit === 0 ? 'Unlimited' : coupon.limit}
                              </TableCell>
                              <TableCell>{coupon.used}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  <span className="text-xs">
                                    {new Date(coupon.startDate).toLocaleDateString()} -{' '}
                                    {new Date(coupon.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    coupon.status === 'Active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {coupon.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      navigator.clipboard.writeText(coupon.code);
                                      toast({
                                        title: 'Success',
                                        description: `Copied ${coupon.code} to clipboard`,
                                      });
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingCoupon(coupon);
                                      setFormData({
                                        code: coupon.code,
                                        discount: coupon.discount,
                                        type: coupon.type,
                                        minPurchase: coupon.minPurchase,
                                        limit: coupon.limit,
                                        startDate: new Date(coupon.startDate)
                                          .toISOString()
                                          .split('T')[0],
                                        endDate: new Date(coupon.endDate)
                                          .toISOString()
                                          .split('T')[0],
                                      });
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCoupon(coupon._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center h-24">
                            No expired coupons found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upcoming" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Upcoming Coupons</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Package className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8 w-8 p-0"
                  >
                    <BarChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                filteredCoupons.filter(coupon => new Date(coupon.startDate) > new Date()).length >
                0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredCoupons
                      .filter(coupon => new Date(coupon.startDate) > new Date())
                      .map(coupon => (
                        <CouponCard
                          key={coupon._id}
                          coupon={coupon}
                          onEdit={coupon => {
                            setEditingCoupon(coupon);
                            setFormData({
                              code: coupon.code,
                              discount: coupon.discount,
                              type: coupon.type,
                              minPurchase: coupon.minPurchase,
                              limit: coupon.limit,
                              startDate: new Date(coupon.startDate).toISOString().split('T')[0],
                              endDate: new Date(coupon.endDate).toISOString().split('T')[0],
                            });
                          }}
                          onDelete={handleDeleteCoupon}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No upcoming coupons found.</p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Min Purchase</TableHead>
                        <TableHead>Usage Limit</TableHead>
                        <TableHead>Used</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCoupons.filter(coupon => new Date(coupon.startDate) > new Date())
                        .length > 0 ? (
                        filteredCoupons
                          .filter(coupon => new Date(coupon.startDate) > new Date())
                          .map(coupon => (
                            <TableRow key={coupon._id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <Tag className="h-4 w-4 mr-2 text-primary" />
                                  {coupon.code}
                                </div>
                              </TableCell>
                              <TableCell>{coupon.discount}</TableCell>
                              <TableCell>{coupon.type}</TableCell>
                              <TableCell>${coupon.minPurchase}</TableCell>
                              <TableCell>
                                {coupon.limit === 0 ? 'Unlimited' : coupon.limit}
                              </TableCell>
                              <TableCell>{coupon.used}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  <span className="text-xs">
                                    {new Date(coupon.startDate).toLocaleDateString()} -{' '}
                                    {new Date(coupon.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    coupon.status === 'Active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {coupon.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      navigator.clipboard.writeText(coupon.code);
                                      toast({
                                        title: 'Success',
                                        description: `Copied ${coupon.code} to clipboard`,
                                      });
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingCoupon(coupon);
                                      setFormData({
                                        code: coupon.code,
                                        discount: coupon.discount,
                                        type: coupon.type,
                                        minPurchase: coupon.minPurchase,
                                        limit: coupon.limit,
                                        startDate: new Date(coupon.startDate)
                                          .toISOString()
                                          .split('T')[0],
                                        endDate: new Date(coupon.endDate)
                                          .toISOString()
                                          .split('T')[0],
                                      });
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCoupon(coupon._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center h-24">
                            No upcoming coupons found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Coupons;