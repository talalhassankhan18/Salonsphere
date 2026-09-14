import ProductDetail from "./components/product-details";
import Link from "next/link";
import mongoose from "mongoose";
import dbConnect from "@/dbConnect";
import Product from "@/mongoose-models/product";
// import CategoryNavMenu from "@/common/category-nav-menu";
import { ProductType } from "types"; // Import shared types

interface Params {
  id: string;
}

// Define the expected API product structure
interface ApiProduct {
  _id: string;
  name: string;
  imageUrls?: string[];
  price?: number;
  discount?: number;
  category?: { name: string };
  description?: string;
  stock?: number;
  sold?: number;
  howToUse?: string;
  maxAllowedInCart?: number;
  rating?: number;
  salonRefId?: string;
  attributes?: { attributeId: { name: string; values: string[] } }[];
  createdAt?: string;
  updatedAt?: string;
  uniqueProductCode?: string; // Added to match ProductType
}

// Helper function to map API response to ProductType
const mapApiProductToProductType = (apiProduct: ApiProduct): ProductType => {
  const price = apiProduct.price || 0;
  const discountPercent = apiProduct.discount || 0;
  return {
    _id: apiProduct._id,
    title: apiProduct.name,
    subtitle: apiProduct.category?.name || "Unknown Category",
    description: apiProduct.description || "No description available",
    image: apiProduct.imageUrls?.[0] || "/placeholder.svg",
    imageUrls: apiProduct.imageUrls || [], // Added to satisfy ProductType
    price: price,
    discountedPrice: discountPercent ? price - price * (discountPercent / 100) : null,
    status: apiProduct.stock && apiProduct.stock > 0 ? "active" : "out-of-stock",
    stockStatus: apiProduct.stock && apiProduct.stock > 0 ? "In Stock" : "Out of Stock",
    sold: apiProduct.sold || 0,
    howToUse: apiProduct.howToUse || "No usage instructions available",
    maxAllowedInCart: apiProduct.maxAllowedInCart || 10,
    rating: apiProduct.rating ? apiProduct.rating.toString() : "0",
    discountPercent: discountPercent,
    salonRefId: apiProduct.salonRefId,
    variations: apiProduct.attributes?.map((attr) => ({
      title: attr.attributeId?.name || "Unknown",
      variationList: attr.attributeId?.values || [],
    })) || [],
    uniqueProductCode: apiProduct.uniqueProductCode, // Map from ApiProduct
    inventory: apiProduct.stock ? { stock: apiProduct.stock, lowStockThreshold: 10 } : undefined,
    stock: apiProduct.stock,
    createdAt: apiProduct.createdAt || new Date().toISOString(),
    updatedAt: apiProduct.updatedAt || new Date().toISOString(),
  };
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { id } = await params;

  try {
    // Server component: read straight from the database (same query as
    // GET /api/products/[id]). This used to fetch a hardcoded production
    // URL, so any other environment showed "Product not found".
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Product not found");
    }
    await dbConnect();
    const doc = await Product.findById(id)
      .populate("category", "name")
      .populate("attributes.attributeId", "name values")
      .lean();

    if (!doc) {
      throw new Error("Product not found");
    }

    // Serialise ObjectIds/Dates the same way the JSON API would
    const data: ApiProduct = JSON.parse(JSON.stringify(doc));
    const product = mapApiProductToProductType(data);

    return (
      <>
        {/* <CategoryNavMenu /> */}
        <ProductDetail product={product} />
      </>
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return (
      <>
        {/* <CategoryNavMenu /> */}
        <div className="hero min-h-[70vh] bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="font-bold text-5xl">Product not found</h1>
              <p className="py-6">This product is not available</p>
              <Link href="/selfcare-products">
                <button className="btn btn-secondary">Continue Shopping</button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default Page;