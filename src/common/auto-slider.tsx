"use client";

import * as React from "react";
import HeroImg1 from "@/assets/images/home-hero-img-1.webp";
import HeroImg2 from "@/assets/images/home-hero-img-2.webp";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import Link from "next/link";

type Props = {
  srcs?: string[];
  delay?: number;
};

const AutoSlider = ({ srcs = [], delay = 15000 }: Props) => {
  // Deduplicate image URLs to prevent duplicate key errors
  const _srcs = Array.from(new Set(srcs.length > 0 ? srcs : [HeroImg1.src, HeroImg2.src]));

  const modules = [Autoplay, EffectCoverflow];

  return (
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
      onError={(e) => console.error("[AutoSlider Swiper] Error:", e)}
      className="mb-6 w-full md:mb-8"
    >
      {_srcs.map((s, index) => (
        <SwiperSlide key={`${s}-${index}`}>
          <div className="w-full h-full md:h-full relative">
            <Link href={index === 0 ? "/salons" : "/selfcare-products"}>
              <img
                src={s}
                className="w-full h-full object-cover rounded-lg"
                alt={`Hero Banner ${index + 1}`}
              />
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default AutoSlider;