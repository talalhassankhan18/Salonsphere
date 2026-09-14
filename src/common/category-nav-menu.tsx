"use client";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { FaSortDown } from "react-icons/fa";
import Link from "next/link";

// Define interfaces for the product and category data
interface Product {
  createdAt: string | number | Date;
  _id: string;
  name: string;
  category: { name: string };
}

interface Category {
  name: string;
  items: string[]; // Product names
}

const CategoryNavMenu = ({ className }: { className?: string }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const result = await response.json();

        if (result.success) {
          const products: Product[] = result.data;

          // Define the categories we want to display in the navbar
          const predefinedCategories = [
            "Best Sellers",
            "New Arrivals",
            "Budget Friendly",
            "Loreal Products", // For Shop by Brand (L'Oréal Products)
          ];

          // Process products for each category
          const processedCategories: Category[] = predefinedCategories.map(
            (categoryName) => {
              let filteredProducts: Product[] = [];

              if (categoryName === "New Arrivals") {
                // Sort by createdAt for New Arrivals
                filteredProducts = products
                  .filter((p) => p.category.name !== "For Salon Listing")
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .slice(0, 5);
              } else {
                // Filter by category name for other categories
                filteredProducts = products
                  .filter(
                    (p) =>
                      p.category.name === categoryName &&
                      p.category.name !== "For Salon Listing"
                  )
                  .slice(0, 5);
              }

              return {
                name: categoryName,
                items: filteredProducts.map((p) => p.name),
              };
            }
          );

          // Add additional categories dynamically from the products
          const additionalCategories = Array.from(
            new Set(
              products
                .filter((p) => !predefinedCategories.includes(p.category.name))
                .map((p) => p.category.name)
            )
          )
            .filter((name) => name !== "For Salon Listing")
            .map((categoryName) => {
              const categoryProducts = products
                .filter((p) => p.category.name === categoryName)
                .slice(0, 5);
              return {
                name: categoryName,
                items: categoryProducts.map((p) => p.name),
              };
            });

          setCategories([...processedCategories, ...additionalCategories]);
        } else {
          setError(result.error || "Failed to fetch products");
        }
      } catch (err) {
        setError("An error occurred while fetching products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleMouseEnter = (categoryName: string) =>
    setHoveredCategory(categoryName);
  const handleMouseLeave = () => setHoveredCategory(null);
  const handleMobileMenuToggle = (categoryName: string) =>
    setMobileMenuOpen((prev) => (prev === categoryName ? null : categoryName));

  if (loading) {
    return (
      <div className="text-center py-2 text-white">Loading categories...</div>
    );
  }

  if (error) {
    return <div className="text-center py-2 text-red-500">{error}</div>;
  }

  return (
    <nav
      className={cn(
        "bg-[#282A36] border-b sticky top-[60px] z-40 shadow-md",
        className
      )}
    >
      <div className="container mx-auto">
        {/* Desktop View */}
        <div className="hidden sm:flex justify-center space-x-4 p-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className="relative"
              onMouseEnter={() => handleMouseEnter(category.name)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={cn(
                  "px-4 py-3 text-white text-sm font-medium transition duration-150 hover:text-primary",
                  hoveredCategory === category.name && "text-primary"
                )}
              >
                {category.name === "Loreal Products"
                  ? "Shop by Brand"
                  : category.name}
                <FaSortDown
                  className={cn(
                    "text-xs ml-1 transition-transform",
                    hoveredCategory === category.name
                      ? "-rotate-180"
                      : "rotate-0"
                  )}
                />
              </button>
              {hoveredCategory === category.name && (
                <div className="absolute bg-[#282A36] shadow-lg border border-gray-100 rounded-lg z-40 w-[150px] py-2 mt-1">
                  {category.items.map((item, index) => (
                    <Link
                      key={index}
                      href={`/selfcare-products?category=${encodeURIComponent(
                        category.name
                      )}`}
                      className="block px-4 py-1.5 text-xs text-white hover:bg-gray-700 transition"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile View */}
        <div className="sm:hidden flex flex-col">
          {categories.map((category) => (
            <div key={category.name} className="relative">
              <button
                className="w-full text-left px-4 py-2 text-sm text-white font-medium flex justify-between items-center"
                onClick={() => handleMobileMenuToggle(category.name)}
              >
                {category.name === "Loreal Products"
                  ? "Shop by Brand"
                  : category.name}
                <FaSortDown
                  className={cn(
                    "text-xs transition-transform",
                    mobileMenuOpen === category.name
                      ? "-rotate-180"
                      : "rotate-0"
                  )}
                />
              </button>
              {mobileMenuOpen === category.name && (
                <div className="bg-[#282A36] shadow-lg border border-gray-100 rounded-lg z-40 w-full mt-1">
                  {category.items.map((item, index) => (
                    <Link
                      key={index}
                      href={`/selfcare-products?category=${encodeURIComponent(
                        category.name
                      )}`}
                      className="block px-4 py-1.5 text-xs text-white hover:bg-gray-700 transition"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNavMenu;
