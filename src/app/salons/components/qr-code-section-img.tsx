"use client";
import * as React from "react";
import QrcodeImg from "@/assets/images/Glimmer-Qrcode-section-img.png";
import AutoSlider from "@/common/auto-slider";
type Props = {
	srcs?: string[];
};

const QrCodeSection = ({ srcs = [] }: Props) => {
	const _srcs = srcs.length > 0 ? srcs : [QrcodeImg.src];

	return (
		<div className="mb-6 md:mb-8">
			<AutoSlider srcs={_srcs} />
		</div>
	);
};

export default QrCodeSection;
