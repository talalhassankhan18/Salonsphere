"use client";
import { mapProductToCartItem } from "@/store/cartStore";
import { useCartStoreContext } from "@/store/cartStoreContext";
import { CartItem } from "../../../../../types";
import React, { useState } from "react";
import HotDeals from "./Hot-deals";
import toast from "react-hot-toast";
import { FaCopy } from "react-icons/fa";

interface ProductType {
	_id?: string;
	title: string;
	description: string;
	image: string;
	howToUse: string;
	maxAllowedInCart: number;
	rating: number;
	price: number;
	discountPercent?: number;
	salonRefId?: string;
	variations: {
		title: string;
		variationList: string[];
	}[];
}

interface ProductDetailProps {
	product: ProductType;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
	const { addItem } = useCartStoreContext();
	const [quantity, setQuantity] = useState(1);
	const [selectedVariations, setSelectedVariations] = useState<
		{
			title: string;
			variationListItem: string;
		}[]
	>([]);

	const handleAddToCart = () => {
		if (quantity <= product.maxAllowedInCart) {
			const toAddCart: CartItem = mapProductToCartItem(product);
			toAddCart.quantity = quantity;
			toAddCart.selectedVariations = selectedVariations;
			addItem(toAddCart);
		} else {
			alert(`Maximum allowed quantity in cart is ${product.maxAllowedInCart}`);
		}
	};

	const handleVariationSelect = (variationTitle: string, option: string) => {
		setSelectedVariations((prev) => ({ ...prev, [variationTitle]: option }));
	};

	// Open the modal
	const openModal = () => {
		const modal = document.getElementById(
			"bulk-buy-model",
		) as HTMLDialogElement;
		modal?.showModal();
	};

	// Close the modal
	const closeModal = () => {
		const modal = document.getElementById(
			"bulk-buy-model",
		) as HTMLDialogElement;
		modal?.close();
	};

	return (
		<>
			<div className="mb-8 flex flex-col justify-center gap-8 p-8 md:mb-5 md:flex-row md:gap-16 lg:mb-10">
				{/* Left Side: Product Image Gallery */}
				<div className="flex flex-col items-center">
					<img
						src={product.image}
						alt={product.title}
						className="h-80 w-80 rounded-md object-cover shadow"
					/>
					<div className="mt-6 flex gap-4">
						{/* Thumbnail Images (dummy images for now) */}
						<div className="artboard size-20 bg-base-300">80×80</div>
						<div className="artboard size-20 bg-base-300">80×80</div>
						<div className="artboard size-20 bg-base-300">80×80</div>
					</div>
				</div>

				{/* Right Side: Product Info */}
				<div className="flex flex-col gap-4">
					<h1 className="font-semibold text-2xl">{product.title}</h1>
					<div className="mb-6 flex items-center gap-2">
						<div className="rating">
							{[...Array(5)].map((_, i) => (
								<input
									key={i}
									type="radio"
									name="rating-2"
									className={`mask mask-star-2 ${
										i < Math.round(product.rating)
											? "bg-primary"
											: "bg-gray-500"
									}`}
									checked={i < Math.round(product.rating)}
									readOnly
								/>
							))}
						</div>
						<span className="text-gray-600">{product.rating} Rating</span>
						<span className="text-green-600">In Stock</span>
					</div>

					{/* Quantity Selector */}
					<div className="flex items-center gap-2">
						<span>Quantity</span>
						<button
							onClick={() => setQuantity(Math.max(1, quantity - 1))}
							className="btn btn-xs btn-outline"
						>
							-
						</button>
						<span>{quantity}</span>
						<button
							onClick={() =>
								setQuantity(Math.min(quantity + 1, product.maxAllowedInCart))
							}
							className="btn btn-xs btn-outline"
						>
							+
						</button>
					</div>

					{/* Price */}
					<div className="font-semibold text-2xl">
						{product.price.toFixed(2)} <span className="text-lg">PKR</span>
						<span className="text-gray-500 text-sm">
							{" "}
							{product.discountPercent ? `-${product.discountPercent}%` : ""}
						</span>
					</div>

					{/* Add to Cart Button */}
					<button
						className="btn btn-secondary btn-wide"
						onClick={handleAddToCart}
					>
						Add to Cart
					</button>

					<p
						className="link link-secondary mt-1 text-center text-lg"
						onClick={() =>
							(
								document.getElementById("bulk-buy-model") as HTMLDialogElement
							)?.showModal()
						}
					>
						Bulk Buy?
					</p>

					<dialog id="bulk-buy-model" className="modal modal-middle">
						<div className="modal-box">
							<h3 className="font-bold text-lg">Dear Customer!</h3>
							<p className="py-4">
								Contact us on WhatsApp at{" "}
								<button
									className="btn btn-link text-neutral"
									onClick={() => {
										navigator.clipboard.writeText("0331-2062376").then(() => {
											toast.success("Copied to clipboard!");
										});
									}}
								>
									0331-2062376
									<FaCopy className="size-5" />
								</button>
								to confirm your bulk order. Thanks for using Glimmer.
							</p>
							<div className="modal-action">
								<button
									className="btn"
									onClick={() =>
										(
											document.getElementById(
												"bulk-buy-model",
											) as HTMLDialogElement
										)?.close()
									}
								>
									Close
								</button>
							</div>
						</div>
						<form method="dialog" className="modal-backdrop">
							<button>close</button>
						</form>
					</dialog>

					{/* Product Details and How to Use (Collapsible sections) */}
					<div className="mt-4">
						<div
							tabIndex={0}
							className="collapse-arrow collapse rounded-box border border-base-300 bg-base-100"
						>
							<div className="collapse-title font-medium text-lg">
								Product Details
							</div>
							<div className="collapse-content">
								<p>{product.description}</p>
								{/* Add more details as needed */}
							</div>
						</div>
						<div
							tabIndex={0}
							className="collapse-arrow collapse mt-2 rounded-box border border-base-300 bg-base-100"
						>
							<div className="collapse-title font-medium text-lg">
								How to Use
							</div>
							<div className="collapse-content">
								<p>{product.howToUse}</p>
							</div>
						</div>
					</div>

					{/* Variations */}
					{product.variations.map((variation) => (
						<div key={variation.title} className="mt-4">
							<h3 className="font-semibold">{variation.title}</h3>
							<div className="mt-2 flex gap-2">
								{variation.variationList.map((option) => (
									<button
										key={option}
										className={`btn btn-sm btn-outline ${
											variation.variationList.includes(option) ? "" : ""
										}`}
										onClick={() =>
											handleVariationSelect(variation.title, option)
										}
									>
										{option}
									</button>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
			<HotDeals />
		</>
	);
};

export default ProductDetail;
