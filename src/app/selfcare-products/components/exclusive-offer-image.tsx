"use client";

import * as React from "react";
import shopBrand1 from "@/assets/shop-brand-slider/shop-brand-slider-1.png";
import shopBrand2 from "@/assets/shop-brand-slider/shop-brand-slider-2.png";
import shopBrand3 from "@/assets/shop-brand-slider/shop-brand-slider-3.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import Link from "next/link";

type Props = {
  srcs?: string[];
  delay?: number;
};

// Define the expected shape of the /api/Banners response
interface Banner {
  imageUrl: string;
  [key: string]: any; // Allow other fields
}

interface BannerResponse {
  success: boolean;
  data: Banner[];
}

// Module-level so the effect below need not depend on it.
const defaultImages = [shopBrand1.src, shopBrand2.src, shopBrand3.src];

const AutoSliderShopBrand = ({
  srcs = [],
  delay = 10000, // Default to 1 second
}: Props) => {
  const [bannerImages, setBannerImages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Default images as fallback

  // Fetch banners from API
  React.useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/Banners");
        const data: BannerResponse = await response.json();

        if (data.success && data.data.length > 0) {
          // Extract unique image URLs from the banners
          const images = Array.from(
            new Set(
              data.data
                .filter((banner) => banner.imageUrl) // Ensure imageUrl exists
                .map((banner) => banner.imageUrl)
            )
          );
          setBannerImages(images);
        } else {
          setBannerImages(defaultImages); // Fallback to default images if no banners
        }
      } catch (err) {
        console.error("[AutoSliderShopBrand] Error fetching banners:", err);
        setError("Failed to load banners");
        setBannerImages(defaultImages); // Fallback to default images on error
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Use provided srcs if available, otherwise use fetched bannerImages or defaultImages
  const _srcs = Array.from(
    new Set(srcs.length > 0 ? srcs : bannerImages.length > 0 ? bannerImages : defaultImages)
  );

  const modules = [Autoplay, EffectCoverflow];

  return (
    <div className="mt-4">
      {loading ? (
        <div className="w-full h-80 flex items-center justify-center">
          <p>Loading banners...</p>
        </div>
      ) : error ? (
        <div className="w-full h-80 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <Swiper
          modules={modules}
          spaceBetween={0}
          slidesPerView={1}
          effect="coverflow"
          coverflowEffect={{
            rotate: 50, // Rotate slides for 3D effect
            stretch: 0, // Space between slides
            depth: 100, // Depth of the 3D effect
            modifier: 1, // Effect multiplier
            slideShadows: true, // Enable shadows for depth
          }}
          autoplay={{ delay }}
          onError={(e) => console.error("[AutoSliderShopBrand Swiper] Error:", e)}
          className="mb-6 w-full md:mb-8"
        >
          {_srcs.map((s, index) => (
            <SwiperSlide key={`${s}-${index}`}>
              <Link href="/selfcare-products?brand=loreal">
                <div className="w-full h-80 md:h-80 relative">
                  <img
                    src={s}
                    className="w-full h-full object-cover rounded-lg"
                    alt={`Shop by Brands Banner ${index + 1}`}
                  />
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default AutoSliderShopBrand;