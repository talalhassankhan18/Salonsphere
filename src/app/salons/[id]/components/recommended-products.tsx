import Link from "next/link";
import CardList from "@/common/card-list";
import { ProductType } from "../../../../../types";

interface RecommendedProductsProps {
  salonId: string;
}

const RecommendedProducts = async ({ salonId }: RecommendedProductsProps) => {
  let products: ProductType[] = [];
  let error: string | null = null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const apiUrl = `${baseUrl}/api/salon/products?salonId=${salonId}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch products from API");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch products");
    }

    products = data.data.listedProducts.map((product: any) => ({
      _id: product._id || "",
      title: product.name || "Unnamed Product",
      image: product.imageUrl || "/default-product-image.jpg",
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
      stockStatus: product.stock === 0 ? "Out of Stock" : "In Stock", // Simplified; "Restocked" requires additional logic
    }));
  } catch (err) {
    console.error("Error fetching recommended products:", err);
    error = "Failed to load recommended products.";
  }

  if (error) {
    return (
      <div className="px-2 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-2">
      <Link href="/selfcare-products" className="prose lg:prose-xl">
        <h2 className="mb-2 md:mb-3">Recommended Products</h2>
      </Link>
      {products.length === 0 ? (
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
