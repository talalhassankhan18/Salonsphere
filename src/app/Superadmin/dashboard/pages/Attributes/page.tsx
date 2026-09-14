'use client';

import { useCallback, useState, useEffect } from 'react';
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
import { toast } from '@/app/Superadmin/dashboard/components/ui/use-toast';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  BarChart,
} from 'lucide-react';

interface IAttribute {
  _id: string;
  name: string;
  values: string[];
  filterable: boolean;
  required: boolean;
  createdAt: string;
  updatedAt: string;
}

const AttributeCard = ({
  attribute,
  onEdit,
  onDelete,
}: {
  attribute: IAttribute;
  onEdit: (attribute: IAttribute) => void;
  onDelete: (id: string) => void;
}) => (
  <Card className="h-full w-full max-w-md">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{attribute.name}</CardTitle>
      <CardDescription>Attribute</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-xs text-muted-foreground">
        <div className="flex justify-between mb-1">
          <span>Values</span>
          <span>{attribute.values.join(', ') || 'None'}</span>
        </div>
        <div className="flex justify-between">
          <span>Filterable</span>
          <span>{attribute.filterable ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex justify-between">
          <span>Required</span>
          <span>{attribute.required ? 'Yes' : 'No'}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[80px]"
          onClick={() => onEdit(attribute)}
        >
          <Edit className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-[80px]"
          onClick={() => onDelete(attribute._id)}
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Delete
        </Button>
      </div>
    </CardContent>
  </Card>
);

const Attributes = () => {
  const [attributes, setAttributes] = useState<IAttribute[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<IAttribute | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    values: [] as string[],
    filterable: false,
    required: false,
  });

  const fetchAttributes = useCallback(async () => {
    try {
      const response = await fetch(`/api/Attribute?search=${searchTerm}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const result = await response.json();
      if (result.success) {
        setAttributes(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching attributes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attributes',
        variant: 'destructive',
      });
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Attribute name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/Attribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          values: [],
          filterable: false,
          required: false,
        });
        await fetchAttributes();
        toast({
          title: 'Success',
          description: 'Attribute added successfully',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding attribute:', error);
      toast({
        title: 'Error',
        description: 'Failed to add attribute',
        variant: 'destructive',
      });
    }
  };

  const handleEditAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttribute || !formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Attribute name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/Attribute/${editingAttribute._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        setEditingAttribute(null);
        setFormData({
          name: '',
          values: [],
          filterable: false,
          required: false,
        });
        await fetchAttributes();
        toast({
          title: 'Success',
          description: 'Attribute updated successfully',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating attribute:', error);
      toast({
        title: 'Error',
        description: 'Failed to update attribute',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    try {
      const response = await fetch(`/api/Attribute/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchAttributes();
        toast({
          title: 'Success',
          description: 'Attribute deleted successfully',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting attribute:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete attribute',
        variant: 'destructive',
      });
    }
  };

  const handleValuesChange = (value: string) => {
    const values = value
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);
    setFormData({ ...formData, values });
  };

  const filteredAttributes = attributes.filter(
    attr => attr.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attributes</h1>
          <p className="text-muted-foreground">Manage your product attributes</p>
        </div>
        <Button className="sm:self-start" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Attribute
        </Button>
      </div>

      {/* Add/Edit Attribute Modal */}
      {(isAddModalOpen || editingAttribute) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{editingAttribute ? 'Edit Attribute' : 'Add Attribute'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={editingAttribute ? handleEditAttribute : handleAddAttribute}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Values</label>
                  <Input
                    value={formData.values.join(', ')}
                    onChange={e => handleValuesChange(e.target.value)}
                    placeholder="Enter comma-separated values"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Input
                      type="checkbox"
                      checked={formData.filterable}
                      onChange={e =>
                        setFormData({ ...formData, filterable: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    Filterable
                  </label>
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Input
                      type="checkbox"
                      checked={formData.required}
                      onChange={e =>
                        setFormData({ ...formData, required: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    Required
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingAttribute ? 'Update' : 'Add'} Attribute
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingAttribute(null);
                      setFormData({
                        name: '',
                        values: [],
                        filterable: false,
                        required: false,
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Attributes</TabsTrigger>
            <TabsTrigger value="filterable">Filterable</TabsTrigger>
            <TabsTrigger value="required">Required</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attributes..."
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
                <CardTitle>All Attributes</CardTitle>
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
                filteredAttributes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAttributes.map(attr => (
                      <AttributeCard
                        key={attr._id}
                        attribute={attr}
                        onEdit={attribute => {
                          setEditingAttribute(attribute);
                          setFormData({
                            name: attribute.name,
                            values: attribute.values,
                            filterable: attribute.filterable,
                            required: attribute.required,
                          });
                        }}
                        onDelete={handleDeleteAttribute}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No attributes found.</p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Values</TableHead>
                        <TableHead>Filterable</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttributes.length > 0 ? (
                        filteredAttributes.map(attr => (
                          <TableRow key={attr._id}>
                            <TableCell className="font-medium">{attr.name}</TableCell>
                            <TableCell>{attr.values.join(', ') || 'None'}</TableCell>
                            <TableCell>{attr.filterable ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{attr.required ? 'Yes' : 'No'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingAttribute(attr);
                                    setFormData({
                                      name: attr.name,
                                      values: attr.values,
                                      filterable: attr.filterable,
                                      required: attr.required,
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteAttribute(attr._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            No attributes found.
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
        <TabsContent value="filterable" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Filterable Attributes</CardTitle>
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
                filteredAttributes.filter(attr => attr.filterable).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAttributes
                      .filter(attr => attr.filterable)
                      .map(attr => (
                        <AttributeCard
                          key={attr._id}
                          attribute={attr}
                          onEdit={attribute => {
                            setEditingAttribute(attribute);
                            setFormData({
                              name: attribute.name,
                              values: attribute.values,
                              filterable: attribute.filterable,
                              required: attribute.required,
                            });
                          }}
                          onDelete={handleDeleteAttribute}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No filterable attributes found.</p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Values</TableHead>
                        <TableHead>Filterable</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttributes.filter(attr => attr.filterable).length > 0 ? (
                        filteredAttributes
                          .filter(attr => attr.filterable)
                          .map(attr => (
                            <TableRow key={attr._id}>
                              <TableCell className="font-medium">{attr.name}</TableCell>
                              <TableCell>{attr.values.join(', ') || 'None'}</TableCell>
                              <TableCell>{attr.filterable ? 'Yes' : 'No'}</TableCell>
                              <TableCell>{attr.required ? 'Yes' : 'No'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingAttribute(attr);
                                      setFormData({
                                        name: attr.name,
                                        values: attr.values,
                                        filterable: attr.filterable,
                                        required: attr.required,
                                      });
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteAttribute(attr._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            No filterable attributes found.
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
        <TabsContent value="required" className="m-0">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Required Attributes</CardTitle>
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
                filteredAttributes.filter(attr => attr.required).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAttributes
                      .filter(attr => attr.required)
                      .map(attr => (
                        <AttributeCard
                          key={attr._id}
                          attribute={attr}
                          onEdit={attribute => {
                            setEditingAttribute(attribute);
                            setFormData({
                              name: attribute.name,
                              values: attribute.values,
                              filterable: attribute.filterable,
                              required: attribute.required,
                            });
                          }}
                          onDelete={handleDeleteAttribute}
                        />
                      ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No required attributes found.</p>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Values</TableHead>
                        <TableHead>Filterable</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttributes.filter(attr => attr.required).length > 0 ? (
                        filteredAttributes
                          .filter(attr => attr.required)
                          .map(attr => (
                            <TableRow key={attr._id}>
                              <TableCell className="font-medium">{attr.name}</TableCell>
                              <TableCell>{attr.values.join(', ') || 'None'}</TableCell>
                              <TableCell>{attr.filterable ? 'Yes' : 'No'}</TableCell>
                              <TableCell>{attr.required ? 'Yes' : 'No'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingAttribute(attr);
                                      setFormData({
                                        name: attr.name,
                                        values: attr.values,
                                        filterable: attr.filterable,
                                        required: attr.required,
                                      });
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteAttribute(attr._id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24">
                            No required attributes found.
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

export default Attributes;