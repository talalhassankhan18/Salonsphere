"use client";

import { useState, useEffect } from "react";
import CardList from "@/common/card-list";
import Link from "next/link";
import Image from "next/image";
import { useCartStoreContext } from "@/store/cartStoreContext";
import { mapProductToCartItem } from "@/store/cartStore";
import { ProductType } from "types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Product {
  _id: string;
  name: string;
  category: { name: string };
  price: number;
  discount?: number;
  stock: number;
  attributes: {
	attributeId: { name: string; values: string[] };
	value: string;
  }[];
  imageUrls: string[];
  description: string;
  howToUse: string;
  status: "active" | "inactive" | "out-of-stock";
  sold: number;
  revenue: number;
  maxAllowedInCart: number;
  createdAt: string;
  updatedAt: string;
  uniqueProductCode?: string; // Added to match ProductType
}

const Allproducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const cartStore = useCartStoreContext();
  const { addItem } = cartStore;

  useEffect(() => {
	const fetchProducts = async () => {
	  try {
		const response = await fetch("/api/products");
		const result = await response.json();
		if (result.success) {
		  const mappedProducts = result.data.map((product: any) => ({
			...product,
			maxAllowedInCart: product.maxAllowedInCart || 10,
			createdAt: new Date(product.createdAt).toISOString(),
			updatedAt: new Date(product.updatedAt).toISOString(),
			status: ["active", "inactive", "out-of-stock"].includes(
			  product.status
			)
			  ? product.status
			  : "active",
		  }));
		  const filteredProducts = mappedProducts.filter(
			(product: Product) => product.category.name !== "For Salon Listing"
		  );
		  setProducts(filteredProducts);
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

  if (loading) {
	return <div className="px-2">Loading...</div>;
  }

  if (error) {
	return <div className="px-2 text-red-500">{error}</div>;
  }

  const cardData: ProductType[] = products.map((product) => {
	const discountedPrice = product.discount
	  ? product.price * (1 - product.discount / 100)
	  : null;

	return {
	  _id: product._id,
	  title: product.name,
	  subtitle: product.category.name,
	  price: product.price,
	  discountedPrice,
	  image: product.imageUrls[0] || "/placeholder.svg",
	  imageUrls: product.imageUrls, // Added to satisfy ProductType
	  rating:
		product.attributes.find(
		  (attr) => attr.attributeId.name.toLowerCase() === "rating"
		)?.value || "4.5",
	  status: product.status,
	  sold: product.sold,
	  description: product.description || "No description available",
	  howToUse: product.howToUse || "No instructions available",
	  maxAllowedInCart: product.maxAllowedInCart,
	  variations: product.attributes.map((attr) => ({
		title: attr.attributeId.name,
		variationList: attr.value ? [attr.value] : [],
		required: false,
	  })),
	  onImageClick: () => setSelectedProduct(product),
	  onAddToCart: () => handleAddToCart(product),
	  createdAt: product.createdAt,
	  updatedAt: product.updatedAt,
	  discountPercent: product.discount || 0,
	  uniqueProductCode: product.uniqueProductCode, // Added to match ProductType
	};
  });

  const handleAddToCart = (product: Product) => {
	const productType: ProductType = cardData.find(
	  (p) => p._id === product._id
	)!;
	const cartItem = mapProductToCartItem(
	  productType,
	  undefined, // salonId
	  undefined // salonName
	);
	addItem(cartItem);
	toast.success(`${product.name} added to cart!`, {
	  position: "bottom-right",
	  autoClose: 3000,
	});
  };

  const handleCloseModal = () => setSelectedProduct(null);

  return (
	<div className="px-2">
	  <Link href="/selfcare-products" className="prose lg:prose-xl">
		<h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
		  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
		  <span className="pl-4">Self-Care Products</span>
		</h3>
	  </Link>
	  <CardList cards={cardData} dataType="product" shouldAnimate={true} />
	  {selectedProduct && (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		  <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
			<h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
			<div className="space-y-4">
			  {selectedProduct.imageUrls &&
				selectedProduct.imageUrls.length > 0 && (
				  <div className="grid grid-cols-2 gap-2">
					{selectedProduct.imageUrls.map((url, index) => (
					  <div key={index} className="relative w-full h-32">
						<Image
						  src={url || "/placeholder.svg"}
						  alt={`${selectedProduct.name}-${index}`}
						  fill
						  sizes="100vw"
						  className="object-cover rounded-md"
						  unoptimized
						  onError={(e) => {
							e.currentTarget.src = "/placeholder.svg";
						  }}
						/>
					  </div>
					))}
				  </div>
				)}
			  <p>
				<strong>Description:</strong>{" "}
				{selectedProduct.description || "No description available"}
			  </p>
			  <p>
				<strong>How to Use:</strong>{" "}
				{selectedProduct.howToUse || "No instructions available"}
			  </p>
			  <button
				onClick={() => handleAddToCart(selectedProduct)}
				className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			  >
				Add to Cart
			  </button>
			</div>
			<button
			  onClick={handleCloseModal}
			  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
			>
			  Close
			</button>
		  </div>
		</div>
	  )}
	  <ToastContainer
		position="bottom-right"
		autoClose={3000}
		hideProgressBar={false}
		newestOnTop={false}
		closeOnClick
		rtl={false}
		pauseOnFocusLoss
		draggable
		pauseOnHover
		theme="light"
	  />
	</div>
  );
};

export default Allproducts;
