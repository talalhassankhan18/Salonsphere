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
  ClipboardList,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Tag,
  ListFilter,
} from "lucide-react";

// Mock data for attributes and values
const attributeData = [
  {
    id: 1,
    name: "Color",
    type: "Color Swatch",
    values: ["Red", "Blue", "Green", "Black", "Blonde", "Brown"],
    productCount: 47,
    filterable: true,
    required: true,
  },
  {
    id: 2,
    name: "Size",
    type: "Button",
    values: ["Small", "Medium", "Large", "XL"],
    productCount: 29,
    filterable: true,
    required: false,
  },
  {
    id: 3,
    name: "Material",
    type: "Dropdown",
    values: ["Plastic", "Metal", "Ceramic", "Glass"],
    productCount: 18,
    filterable: true,
    required: false,
  },
  {
    id: 4,
    name: "Fragrance",
    type: "Radio",
    values: ["Floral", "Fresh", "Woody", "Sweet", "None"],
    productCount: 35,
    filterable: true,
    required: false,
  },
  {
    id: 5,
    name: "Brand",
    type: "Dropdown",
    values: ["SalonPro", "Elegance", "StyleMaster", "LuxHair", "NaturalTouch"],
    productCount: 65,
    filterable: true,
    required: true,
  },
];

const Attributes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  const filteredAttributes = attributeData.filter(
    (attr) =>
      attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attributes</h1>
          <p className="text-muted-foreground">Manage product attributes</p>
        </div>
        <Button className="sm:self-start">
          <Plus className="h-4 w-4 mr-2" />
          Add Attribute
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Product Attributes</CardTitle>
                  <CardDescription>
                    Manage attributes used to define product variations
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search attributes..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Values</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Filterable</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttributes.length > 0 ? (
                      filteredAttributes.map((attr) => (
                        <TableRow
                          key={attr.id}
                          className={
                            selectedAttribute?.id === attr.id
                              ? "bg-muted/50"
                              : ""
                          }
                        >
                          <TableCell className="font-medium">
                            <button
                              className="flex items-center hover:text-primary"
                              onClick={() => setSelectedAttribute(attr)}
                            >
                              <ListFilter className="h-4 w-4 mr-2 text-muted-foreground" />
                              {attr.name}
                            </button>
                          </TableCell>
                          <TableCell>{attr.type}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {attr.values.length > 3 ? (
                                <>
                                  {attr.values.slice(0, 3).map((val, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-muted rounded-full text-xs"
                                    >
                                      {val}
                                    </span>
                                  ))}
                                  <span className="px-2 py-0.5 bg-muted rounded-full text-xs">
                                    +{attr.values.length - 3}
                                  </span>
                                </>
                              ) : (
                                attr.values.map((val, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-muted rounded-full text-xs"
                                  >
                                    {val}
                                  </span>
                                ))
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{attr.productCount}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                attr.filterable
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {attr.filterable ? "Yes" : "No"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                attr.required
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {attr.required ? "Yes" : "No"}
                            </span>
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                          No attributes found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {selectedAttribute ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-primary" />
                  {selectedAttribute.name} Values
                </CardTitle>
                <CardDescription>Manage attribute values</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Attribute Values</div>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Value
                    </Button>
                  </div>
                  <ul className="space-y-2 border rounded-md divide-y">
                    {selectedAttribute.values.map((value, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-2.5"
                      >
                        <span>{value}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 space-y-4">
                    <div className="text-sm font-medium">
                      Attribute Settings
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                        <span className="text-sm">Display Type</span>
                        <span className="font-medium">
                          {selectedAttribute.type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                        <span className="text-sm">Used in Products</span>
                        <span className="font-medium">
                          {selectedAttribute.productCount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                        <span className="text-sm">Filterable</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            selectedAttribute.filterable
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedAttribute.filterable ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                        <span className="text-sm">Required</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            selectedAttribute.required
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedAttribute.required ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64 flex-col gap-2 text-muted-foreground">
                <ClipboardList className="h-8 w-8" />
                <p>Select an attribute to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attributes;
