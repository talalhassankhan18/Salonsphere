"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/dashboard/components/ui/card";
import { Button } from "@/app/Superadmin/dashboard/components/ui/button";
import { Input } from "@/app/Superadmin/dashboard/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/dashboard/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/Superadmin/dashboard/components/ui/dialog";
import { Label } from "@/app/Superadmin/dashboard/components/ui/label";
import { useToast } from "@/app/Superadmin/dashboard/hooks/use-toast";
import {
  Folder,
  FolderPlus,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Star,
  StarOff,
  PlusCircle,
} from "lucide-react";
import { Switch } from "@/app/Superadmin/dashboard/components/ui/switch";

// Category interface
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  subcategories: string[];
  featured: boolean;
}

// API Service Layer
const apiService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch('/api/Category');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Fetched categories:", data);
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async createCategory(category: Omit<Category, 'id' | 'productCount'>): Promise<Category> {
    try {
      console.log("Creating category:", category);
      const response = await fetch('/api/Category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Created category:", data);
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    try {
      console.log("Updating category:", id, category);
      const response = await fetch(`/api/Category/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log("Updated category:", data);
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(id: number): Promise<void> {
    try {
      console.log("Deleting category:", id);
      const response = await fetch(`/api/Category/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      console.log("Deleted category:", id);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};

const Categories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddSubDialogOpen, setIsAddSubDialogOpen] = useState(false);
  const [isEditSubDialogOpen, setIsEditSubDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    featured: false,
  });
  const [newSubcategory, setNewSubcategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getCategories();
        setCategories(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim() || !newCategory.slug.trim()) {
      toast({
        title: "Error",
        description: "Category name and slug are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const categoryData = {
        name: newCategory.name.trim(),
        slug: newCategory.slug.trim(),
        description: newCategory.description.trim() || undefined,
        featured: newCategory.featured,
        subcategories: [],
      };

      const createdCategory = await apiService.createCategory(categoryData);
      setCategories((prev) => [...prev, createdCategory]);
      toast({
        title: "Success",
        description: `Category "${newCategory.name}" added successfully.`,
      });

      setIsAddDialogOpen(false);
      setNewCategory({ name: "", slug: "", description: "", featured: false });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message.includes('slug already exists')
            ? 'A category with this slug already exists.'
            : 'Failed to add category. Please try again.',
        variant: "destructive",
      });
      console.error("Add category error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !newCategory.name.trim() || !newCategory.slug.trim()) {
      toast({
        title: "Error",
        description: "Category name and slug are required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedCategory = await apiService.updateCategory(selectedCategory.id, {
        name: newCategory.name.trim(),
        slug: newCategory.slug.trim(),
        description: newCategory.description.trim() || undefined,
        featured: newCategory.featured,
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === selectedCategory.id ? updatedCategory : cat))
      );
      toast({
        title: "Success",
        description: `Category "${newCategory.name}" updated successfully.`,
      });

      setIsEditDialogOpen(false);
      setNewCategory({ name: "", slug: "", description: "", featured: false });
      setSelectedCategory(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message.includes('slug already exists')
            ? 'A category with this slug already exists.'
            : 'Failed to update category. Please try again.',
        variant: "destructive",
      });
      console.error("Update category error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    setIsLoading(true);
    try {
      await apiService.deleteCategory(selectedCategory.id);
      setCategories((prev) => prev.filter((cat) => cat.id !== selectedCategory.id));
      toast({
        title: "Success",
        description: `Category "${selectedCategory.name}" deleted successfully.`,
      });

      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
      console.error("Delete category error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !newSubcategory.trim()) {
      toast({
        title: "Error",
        description: "Subcategory name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedSubcategories = [...selectedCategory.subcategories, newSubcategory.trim()];
      const updatedCategory = await apiService.updateCategory(selectedCategory.id, {
        subcategories: updatedSubcategories,
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === selectedCategory.id ? updatedCategory : cat))
      );
      toast({
        title: "Success",
        description: `Subcategory "${newSubcategory}" added to "${selectedCategory.name}".`,
      });

      setIsAddSubDialogOpen(false);
      setNewSubcategory("");
      setSelectedCategory(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subcategory. Please try again.",
        variant: "destructive",
      });
      console.error("Add subcategory error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedSubcategory || !newSubcategory.trim()) {
      toast({
        title: "Error",
        description: "Subcategory name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedSubcategories = selectedCategory.subcategories.map((sub) =>
        sub === selectedSubcategory ? newSubcategory.trim() : sub
      );
      const updatedCategory = await apiService.updateCategory(selectedCategory.id, {
        subcategories: updatedSubcategories,
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === selectedCategory.id ? updatedCategory : cat))
      );
      toast({
        title: "Success",
        description: `Subcategory "${selectedSubcategory}" updated to "${newSubcategory}".`,
      });

      setIsEditSubDialogOpen(false);
      setNewSubcategory("");
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subcategory. Please try again.",
        variant: "destructive",
      });
      console.error("Edit subcategory error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubcategory = async (category: Category, subcategory: string) => {
    setIsLoading(true);
    try {
      const updatedSubcategories = category.subcategories.filter((sub) => sub !== subcategory);
      const updatedCategory = await apiService.updateCategory(category.id, {
        subcategories: updatedSubcategories,
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === category.id ? updatedCategory : cat))
      );
      toast({
        title: "Success",
        description: `Subcategory "${subcategory}" deleted from "${category.name}".`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subcategory. Please try again.",
        variant: "destructive",
      });
      console.error("Delete subcategory error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (id: number) => {
    const category = categories.find((cat) => cat.id === id);
    if (!category) return;

    setIsLoading(true);
    try {
      const updatedCategory = await apiService.updateCategory(id, {
        featured: !category.featured,
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      toast({
        title: "Success",
        description: `Category featured status updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive",
      });
      console.error("Toggle featured error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setNewCategory({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      featured: category.featured,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const openAddSubDialog = (category: Category) => {
    setSelectedCategory(category);
    setNewSubcategory("");
    setIsAddSubDialogOpen(true);
  };

  const openEditSubDialog = (category: Category, subcategory: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setNewSubcategory(subcategory);
    setIsEditSubDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Button
          className="sm:self-start"
          onClick={() => setIsAddDialogOpen(true)}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Product Categories</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Subcategories</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Folder className="h-4 w-4 mr-2 text-purple-500" />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell>{category.slug}</TableCell>
                      <TableCell>{category.productCount}</TableCell>
                      <TableCell>
                        {category.subcategories.length > 0 ? (
                          <div className="flex items-center">
                            <span>{category.subcategories.length}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 p-0 px-2"
                              disabled={isLoading}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span>0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(category.id)}
                          className={
                            category.featured
                              ? "text-amber-500"
                              : "text-muted-foreground"
                          }
                          disabled={isLoading}
                        >
                          {category.featured ? (
                            <Star className="h-4 w-4 fill-amber-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" disabled={isLoading}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(category)}
                            disabled={isLoading}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(category)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAddSubDialog(category)}
                            disabled={isLoading}
                          >
                            <FolderPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Hierarchy</CardTitle>
          <CardDescription>
            Visualize and manage the category structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md p-4">
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Folder className="h-5 w-5 mr-2 text-purple-500" />
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({category.productCount} products)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAddSubDialog(category)}
                      disabled={isLoading}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add Sub
                    </Button>
                  </div>
                  {category.subcategories.length > 0 && (
                    <ul className="pl-8 space-y-1 border-l border-dashed ml-2">
                      {category.subcategories.map((sub, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-0.5 bg-border mr-2"></div>
                            <span className="text-sm">{sub}</span>
                          </div>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditSubDialog(category, sub)}
                              disabled={isLoading}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDeleteSubcategory(category, sub)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new product category</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCategory}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="Enter category slug"
                  value={newCategory.slug}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, slug: e.target.value })
                  }
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly version of the name. Usually lowercase with hyphens.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter category description"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={newCategory.featured}
                  onCheckedChange={(checked) =>
                    setNewCategory({ ...newCategory, featured: checked })
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="featured">Featured Category</Label>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCategory}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="Enter category slug"
                  value={newCategory.slug}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, slug: e.target.value })
                  }
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly version of the name. Usually lowercase with hyphens.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter category description"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={newCategory.featured}
                  onCheckedChange={(checked) =>
                    setNewCategory({ ...newCategory, featured: checked })
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="featured">Featured Category</Label>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "
              {selectedCategory?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={isAddSubDialogOpen} onOpenChange={setIsAddSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
            <DialogDescription>
              Add a new subcategory to "{selectedCategory?.name}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubcategory}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory Name</Label>
                <Input
                  id="subcategory"
                  placeholder="Enter subcategory name"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddSubDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Subcategory"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={isEditSubDialogOpen} onOpenChange={setIsEditSubDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Edit subcategory in "{selectedCategory?.name}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubcategory}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory Name</Label>
                <Input
                  id="subcategory"
                  placeholder="Enter subcategory name"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditSubDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;