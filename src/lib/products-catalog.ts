import mongoose from "mongoose";

export interface CatalogProduct {
  id: string;
  productId: string;
  title: string;
  name: string;
  price: number;
  originalPrice?: number;
  netPrice: number;
  discount?: string;
  discountPercent: number;
  image: string;
  imageUrls: string[];
  category: string;
  rating: number;
  reviewsCount: number;
  description: string;
  stock: number;
  inStock: boolean;
}

/**
 * Fetches real active products directly from MongoDB SalonSphere database.
 */
export async function getLiveDatabaseProducts(searchQuery?: string): Promise<CatalogProduct[]> {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      console.warn("MongoDB connection not ready for products query");
      return [];
    }

    // Map category IDs to human-readable names
    const categories = await db.collection("categories").find({}).toArray();
    const catMap = new Map<string, string>();
    for (const c of categories) {
      catMap.set(c._id.toString(), c.name);
    }

    // Query active products from MongoDB
    const rawProducts = await db
      .collection("products")
      .find({ status: { $ne: "inactive" } })
      .toArray();

    if (!rawProducts || rawProducts.length === 0) {
      return [];
    }

    const liveProducts: CatalogProduct[] = rawProducts.map((p) => {
      const id = p._id.toString();
      const price = typeof p.price === "number" ? p.price : 500;
      const discount = typeof p.discount === "number" ? p.discount : 0;
      const netPrice = discount > 0 ? Math.floor(price * (1 - discount / 100)) : price;
      const catName = (p.category && catMap.get(p.category.toString())) || "Care & Beauty";
      const image =
        Array.isArray(p.imageUrls) && p.imageUrls.length > 0
          ? p.imageUrls[0]
          : "/placeholder.svg";

      return {
        id,
        productId: id,
        title: p.name || "Salon Product",
        name: p.name || "Salon Product",
        price,
        originalPrice: discount > 0 ? price : undefined,
        netPrice,
        discount: discount > 0 ? `${discount}% OFF` : undefined,
        discountPercent: discount,
        image,
        imageUrls: p.imageUrls || [image],
        category: catName,
        rating: 4.5,
        reviewsCount: 18,
        description: p.description || "",
        stock: typeof p.stock === "number" ? p.stock : 100,
        inStock: (typeof p.stock === "number" ? p.stock : 100) > 0,
      };
    });

    if (!searchQuery) {
      return liveProducts;
    }

    const q = searchQuery.toLowerCase().trim();
    const matched = liveProducts.filter((p) => {
      const matchName = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat;
    });

    return matched.length > 0 ? matched : liveProducts;
  } catch (err) {
    console.warn("Error fetching live products from MongoDB:", err);
    return [];
  }
}

/**
 * Backwards-compatible alias for getLiveDatabaseProducts
 */
export async function searchCatalogProducts(query: string, limit = 5): Promise<CatalogProduct[]> {
  const products = await getLiveDatabaseProducts(query);
  return products.slice(0, limit);
}

