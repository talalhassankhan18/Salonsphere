import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AreaType,
  CardType,
  ProductType,
  ReviewType,
  SalonType,
} from "../../types";
import { FaRegStar, FaStar } from "react-icons/fa";
import AddToCartBtn from "@/app/selfcare-products/components/add-to-cart-btn";
import CardImage from "@/app/selfcare-products/components/card-image";
import FakeReview from "@/app/components/reviews-fake";
import Link from "next/link";

// Utility to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Trim a string to a specified length
export function trimString(
  str: string | null | undefined,
  max: number = 40
): string {
  if (!str) return "";
  return str.length > max ? `${str.slice(0, max)}...` : str;
}

// Generate a random code (numeric or alphanumeric)
export function generateRandomCode(
  length: number = 6,
  alphanumeric: boolean = false
): string {
  const chars = alphanumeric
    ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    : "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function mapProducts(products: ProductType[]): CardType[] {
  return products.map((item) => ({
    border: true,
    image: (
      <CardImage
        route={`/selfcare-products/${item._id}`}
        src={item.imageUrls?.[0] || item.image || "/placeholder-image.png"} // Use imageUrls[0], fallback to image, then placeholder
        onClick={item.onImageClick}
      />
    ),
    bgColor: "white",
    top: {
      left: (
        <p className="text-nowrap text-lg text-neutral">
          {trimString(item.title, 20)}
        </p>
      ),
      right: (
        <div className="flex items-center">
          <FaStar className="mr-1 mb-1 size-4 text-primary" />
          <span className="text-neutral">{item.rating}</span>
        </div>
      ),
    },
    bottom: {
      left: (
        <div className="flex flex-col">
          {item.discountedPrice !== null &&
          item.discountedPrice !== undefined ? (
            <div className="flex items-center">
              <p className="text-[#878683] text-sm">
                <del>{item.price.toFixed(2)}</del>
              </p>
              <p className="text-base-content text-md ml-2">
                {item.discountedPrice.toFixed(2)} PKR
              </p>
            </div>
          ) : (
            <p className="text-base-content">{item.price.toFixed(2)} PKR</p>
          )}
          <p
            className={cn(
              "text-sm mt-1",
              item.stockStatus === "Out of Stock"
                ? "text-red-600"
                : item.stockStatus === "Restocked"
                ? "text-green-600"
                : "text-gray-600"
            )}
          >
            {item.stockStatus || "In Stock"}
            {item.stockStatus === "Out of Stock" && (
              <span className="ml-1"></span>
            )}
          </p>
        </div>
      ),
      right: item.discountPercent ? (
        <p className="text-success">{item.discountPercent}% off</p>
      ) : null,
    },
    actionBtn: {
      full: item.customButtons?.[0] || (
        <AddToCartBtn
          product={item}
          disabled={item.stockStatus === "Out of Stock"}
        />
      ),
    },
    className: "shadow-md rounded-lg overflow-hidden w-[275px] max-lg:mr-4",
  }));
}

// Map salons to card components
export function mapSalons(salons: SalonType[]): CardType[] {
  return salons.map((salon) => {
    const displayRating =
      salon.ratings && salon.ratings > 0 ? salon.ratings : 4.0;

    return {
      top: {
        left: (
          <h2 className="font-semibold text-2xl text-secondary drop-shadow-md">
            {salon.name}
          </h2>
        ),
        right: (
          <span className="flex items-center text-secondary font-medium text-lg">
            <FaRegStar className="text-primary" /> {displayRating.toFixed(1)}
          </span>
        ),
      },
      bottom: {
        left: <p className="text-gray-600 text-sm italic">{salon.address}</p>,
      },
      actionBtn: {
        right: (
          <Link
            href={`/salons/${encodeURIComponent(salon.name)}`}
            className="w-full bg-secondary text-white py-3 rounded-md shadow-md hover:scale-105 hover:shadow-lg transition-all flex justify-center items-center font-bold"
          >
            Book Now
          </Link>
        ),
      },
      image: (
        <CardImage
          route={`/salons/${encodeURIComponent(salon.name)}`}
          src={salon.image}
        />
      ),
      bgColor: "white",
      className:
        "rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-[#D5AA68]",
    };
  });
}

// Map areas to card components
export function mapAreas(areas: AreaType[]): CardType[] {
  return areas.map((area, i) => ({
    top: {
      full: (
        <div key={i}>
          <div className="mb-2 font-bold text-xl">{area.city}</div>
          {area.salons.map((salon, index) => (
            <p key={index} className="mb-1 text-[#878683] leading-6">
              {salon}
            </p>
          ))}
        </div>
      ),
    },
    actionBtn: {},
    image: null,
    bgColor: "white",
    className:
      "rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
  }));
}

// Map reviews to card components
export function mapReviews(reviews: ReviewType[]): CardType[] {
  return reviews.map((review, i) => ({
    top: {
      full: <FakeReview key={i} review={review} />,
    },
    actionBtn: {},
    image: null,
    bgColor: "white",
    className:
      "rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden p-4",
  }));
}

// Fetch vendor data from API
export async function fetchVendor(): Promise<{ data: any; error?: string }> {
  try {
    const res = await fetch("/api/vendor", { credentials: "include" });
    if (!res.ok) {
      throw new Error(`Failed to fetch vendor data: HTTP ${res.status}`);
    }
    const data = await res.json();
    return { data };
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
