"use client";
import * as React from "react";
import BottomSliderImg1 from "@/assets/images/bottom-slider-img-1.webp";
import BottomSliderImg12 from "@/assets/images/bottom-slider-img-2.webp";
import AutoSlider from "@/common/auto-slider";
type Props = {
	srcs?: string[];
};
const BottomSlider = ({ srcs = [] }: Props) => {
	const _srcs =
		srcs.length > 0 ? srcs : [BottomSliderImg1.src, BottomSliderImg12.src];

	return (
		<div className="mb-6 md:mb-14">
			<AutoSlider type="fade" delay={5000} srcs={_srcs} />
		</div>
	);
};

export default BottomSlider;
