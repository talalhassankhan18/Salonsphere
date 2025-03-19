"use client";
import * as React from "react";
import GymBanner1 from "@/assets/images/gym-banner.png";
import AutoSlider from "@/common/auto-slider";
type Props = {
	srcs?: string[];
};

const GymBanner = ({ srcs = [] }: Props) => {
	const _srcs = srcs.length > 0 ? srcs : [GymBanner1.src];

	return (
		<div className="mb-6 md:mb-14">
			<AutoSlider delay={null} srcs={_srcs} />
		</div>
	);
};

export default GymBanner;
