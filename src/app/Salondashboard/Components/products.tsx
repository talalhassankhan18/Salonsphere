"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FaPlus, FaTrash, FaTag } from "react-icons/fa";

// Product Interface
interface Product {
  id: string;
  name: string;
  image: string; // Image filename like "profile1"
  price: number;
  description: string;
  quantity: number;
  status: "Sold" | "Unsold";
  offer?: string; // Optional offer field
}

// Super Admin's Product List
const superAdminProducts: Product[] = [
  { id: "prod1", name: "Luxury Shampoo", image: "profile1", price: 25, description: "A premium shampoo for silky smooth hair.", quantity: 5, status: "Unsold", offer: "10% off today!" },
  { id: "prod2", name: "Hair Dryer", image: "profile2", price: 120, description: "High-powered professional hair dryer.", quantity: 3, status: "Unsold" },
  { id: "prod3", name: "Hair Serum", image: "profile3", price: 30, description: "Revitalize your hair with our special serum.", quantity: 10, status: "Unsold", offer: "Buy 1 Get 1 Free!" },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [profileProducts, setProfileProducts] = useState<Product[]>(() => {
    // Load saved products from local storage (if any)
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("profileProducts") || "[]");
    }
    return [];
  });

  useEffect(() => {
    setProducts(superAdminProducts);
  }, []);

  // Save Profile Products to Local Storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("profileProducts", JSON.stringify(profileProducts));
    }
  }, [profileProducts]);

  // Add Product to Profile (Prevent Duplicates)
  const addToProfile = (product: Product) => {
    setProfileProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev; // Prevent duplicates
      return [...prev, { ...product, status: "Unsold" }];
    });
  };

  // Remove Product from Profile
  const removeFromProfile = (id: string) => {
    setProfileProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        
        {/* 🔹 Available Products (Super Admin's List) */}
        <SectionTitle title="Available Products" />
        <ProductGrid>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAction={() => addToProfile(product)}
              actionLabel="Add to Profile"
              actionIcon={<FaPlus />}
              actionClass="bg-success hover:bg-success/80"
            />
          ))}
        </ProductGrid>

        {/* 🔹 Your Profile Products (Products You Added) */}
        <SectionTitle title="Your Profile Products" />
        {profileProducts.length === 0 ? (
          <p className="text-muted-foreground text-center">No products added yet.</p>
        ) : (
          <ProductGrid>
            {profileProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                status
                onAction={() => removeFromProfile(product.id)}
                actionLabel="Remove"
                actionIcon={<FaTrash />}
                actionClass="bg-[#E63946] hover:bg-red-700"
              />
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  );
}

// 🏷️ **Reusable ProductCard Component**
const ProductCard = ({ product, onAction, actionLabel, actionIcon, actionClass, status = false }: { 
  product: Product; 
  onAction: () => void;
  actionLabel: string; 
  actionIcon: React.ReactNode;
  actionClass: string;
  status?: boolean;
}) => {
  return (
    <div className="bg-card shadow-lg rounded-lg p-4 transition hover:shadow-xl border">
      <Image
        src={`/uploads/${product.image}.jpg`} // Dynamically load image
        alt={product.name}
        width={300}
        height={200}
        className="w-full h-40 object-cover rounded-md"
      />
      <h3 className="text-lg font-semibold text-primary mt-3">{product.name}</h3>
      <p className="text-muted-foreground">{product.description}</p>
      <p className="text-lg font-bold text-accent mt-2">${product.price}</p>
      <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>

      {product.offer && (
        <p className="text-sm text-warning mt-1 flex items-center gap-2">
          <FaTag className="text-warning" /> {product.offer}
        </p>
      )}

      {status && (
        <p className={`mt-2 text-sm font-semibold ${product.status === "Sold" ? "text-error" : "text-success"}`}>
          Status: {product.status}
        </p>
      )}

      <button className={`mt-3 flex items-center gap-2 text-white px-3 py-2 rounded-md transition w-full justify-center ${actionClass}`} onClick={onAction}>
        {actionIcon} {actionLabel}
      </button>
    </div>
  );
};

// 🏷️ **Reusable SectionTitle Component**
const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-2xl font-bold text-primary mt-8 mb-4">{title}</h2>
);

// 🏷️ **Reusable ProductGrid Component**
const ProductGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">{children}</div>
);
