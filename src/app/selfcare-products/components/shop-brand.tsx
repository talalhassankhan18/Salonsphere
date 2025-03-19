"use client";
import * as React from "react";
import shopBrand1 from "@/assets/shop-brand-slider/shop-brand-slider-1.png";
import shopBrand2 from "@/assets/shop-brand-slider/shop-brand-slider-2.png";
import shopBrand3 from "@/assets/shop-brand-slider/shop-brand-slider-3.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import Link from "next/link";

type Props = {
	srcs?: string[];
	type?:
	| "slide"
	| "fade"
	| "cube"
	| "coverflow"
	| "flip"
	| "creative"
	| "cards";
	delay?: number | null;
};

const AutoSliderShopBrand = ({
	srcs = [],
	type = "slide",
	delay = 3000,
}: Props) => {
	const _srcs =
		srcs.length > 0 ? srcs : [shopBrand1.src, shopBrand2.src, shopBrand3.src];
	const modules = [];
	if (delay) modules.push(Autoplay);
	if (type === "fade") modules.push(EffectFade);

	return (
		<div className="mt-4">
			<Link href="/selfcare-products" className="prose lg:prose-xl">
				<h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
					<span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
					<span className="pl-4">Shop by Brands</span>
				</h3>
			</Link>
			<Swiper
				modules={modules}
				spaceBetween={50}
				slidesPerView={1} // Default to 1 slide on mobile
				effect={type}
				autoplay={{ delay: delay as number }}
				onError={(e) => console.log("[hero swiper] error: ", e)}
				className="mb-6 w-full md:mb-8"
				breakpoints={{
					768: {
						// Medium screen (md) and above (768px+)
						slidesPerView: 2, // Show 2 slides
					},
				}}
				cssMode={true}
			>
				{_srcs.map((s) => (
					<SwiperSlide key={s}>
						<div className="w-full">
							<img src={s} className="w-full" alt="Swiper Carousel component" />
						</div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};

export default AutoSliderShopBrand;
