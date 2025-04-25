"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/Superadmin/components/ui/card";
import { Button } from "@/app/Superadmin/components/ui/button";
import { Input } from "@/app/Superadmin/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/Superadmin/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/Superadmin/components/ui/dialog";
import { Label } from "@/app/Superadmin/components/ui/label";
import { useToast } from "@/app/Superadmin/hooks/use-toast";
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
import { Switch } from "@/app/Superadmin/components/ui/switch";

// Mock data for categories
const categoryData = [
  {
    id: 1,
    name: "Hair Care",
    slug: "hair-care",
    productCount: 67,
    subcategories: ["Shampoo", "Conditioner", "Hair Masks", "Hair Oil"],
    featured: true,
  },
  {
    id: 2,
    name: "Styling Products",
    slug: "styling-products",
    productCount: 43,
    subcategories: ["Gel", "Mousse", "Spray", "Wax"],
    featured: true,
  },
  {
    id: 3,
    name: "Hair Color",
    slug: "hair-color",
    productCount: 29,
    subcategories: ["Permanent", "Semi-Permanent", "Highlights"],
    featured: false,
  },
  {
    id: 4,
    name: "Salon Equipment",
    slug: "salon-equipment",
    productCount: 18,
    subcategories: ["Dryers", "Straighteners", "Curling Tools"],
    featured: false,
  },
  {
    id: 5,
    name: "Men's Products",
    slug: "mens-products",
    productCount: 31,
    subcategories: ["Beard Care", "Shaving", "Hair Styling"],
    featured: true,
  },
];

const Categories = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const filteredCategories = categoryData.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();

    toast({
      title: "Category added",
      description: `The category "${newCategoryName}" has been added successfully.`,
    });

    setIsAddDialogOpen(false);
    setNewCategoryName("");
    setNewCategorySlug("");
    setIsFeatured(false);
  };

  const toggleFeatured = (id: number) => {
    toast({
      title: "Category updated",
      description: `The category featured status has been updated.`,
    });
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
                {filteredCategories.length > 0 ? (
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
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
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
              {categoryData.map((category) => (
                <li key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Folder className="h-5 w-5 mr-2 text-purple-500" />
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({category.productCount} products)
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
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
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
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
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="Enter category slug"
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly version of the name. Usually lowercase with
                  hyphens.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter category description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
                <Label htmlFor="featured">Featured Category</Label>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
