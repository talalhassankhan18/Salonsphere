"use client";
import * as React from "react";
import HeroImg1 from "@/assets/selfcare-slider/selfcare-slider-1.png";
import HeroImg2 from "@/assets/selfcare-slider/selfcare-slider-2.png";
import HeroImg3 from "@/assets/selfcare-slider/selfcare-slider-3.png";
import AutoSlider from "@/common/auto-slider";
import CategoryNavMenu from "@/common/category-nav-menu";
type Props = {
  srcs?: string[];
};
const Hero = ({ srcs = [] }: Props) => {
  const _srcs =
    srcs.length > 0 ? srcs : [HeroImg1.src, HeroImg2.src, HeroImg3.src];
  return (

    <div className="mb-6 md:mb-14">
      <div className="mb-6 md:mb-14">
      <CategoryNavMenu/>
      </div>
      <AutoSlider srcs={_srcs} />
    </div>
  );
};

export default Hero;
