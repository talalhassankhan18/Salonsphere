"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CardList from "@/common/card-list";
import { ProductType } from "../../../../../types";

interface RecommendedProductsProps {
  salonId: string;
}

// Products this salon has listed. Fetched client-side with a relative URL —
// the previous server-component version built an absolute URL from
// NEXT_PUBLIC_BASE_URL (falling back to localhost), which broke on any host
// where that variable wasn't set.
const RecommendedProducts = ({ salonId }: RecommendedProductsProps) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/salon/products?salonId=${salonId}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to fetch products");

        setProducts(
          (data.data.listedProducts as any[]).map((product) => ({
            _id: product._id || "",
            title: product.name || "Unnamed Product",
            image: product.imageUrl || "/placeholder.svg",
            imageUrls: product.imageUrl ? [product.imageUrl] : [],
            price: product.originalPrice || 0,
            discountedPrice: product.price || product.originalPrice || 0,
            rating: product.rating?.toString() || "0",
            discountPercent: product.discountPercent || 0,
            description: product.description || "No description available",
            howToUse: product.howToUse || "No usage instructions provided",
            maxAllowedInCart: 10,
            variations: [],
            salonRefId: undefined,
            uniqueProductCode: product.uniqueProductCode || "",
            sold: product.sold || 0,
            subtitle: "",
            createdAt: product.createdAt || new Date().toISOString(),
            updatedAt: product.updatedAt || new Date().toISOString(),
            status: product.stock > 0 ? "active" : "out-of-stock",
            stock: product.stock || 0,
            stockStatus: product.stock === 0 ? "Out of Stock" : "In Stock",
          }))
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.warn("Error fetching recommended products:", err);
        setError("Failed to load recommended products.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [salonId]);

  return (
    <div className="px-2">
      <Link href="/selfcare-products" className="prose lg:prose-xl">
        <h2 className="mb-2 md:mb-3">Recommended Products</h2>
      </Link>
      {isLoading ? (
        <p className="text-gray-600">Loading products...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">
          No recommended products available for this salon.
        </p>
      ) : (
        <CardList cards={products} dataType="product" shouldAnimate={true} />
      )}
    </div>
  );
};

export default RecommendedProducts;
