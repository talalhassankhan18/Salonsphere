"use client";

import { useState, useEffect } from "react";
import { mapProductToCartItem } from "@/store/cartStore";
import { useCartStoreContext } from "@/store/cartStoreContext";
import { CartItem, ProductType } from "../../../../../types";
import HotDeals from "./Hot-deals";
import toast from "react-hot-toast";

interface ProductDetailProps {
	product: ProductType;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
	const { addItem } = useCartStoreContext();
	const [quantity, setQuantity] = useState(1);
	const [selectedVariations, setSelectedVariations] = useState<
		{ title: string; variationList: string[] }[]
	>([]);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	useEffect(() => {
		// No additional fetch needed since product is passed as a prop
	}, []);

	const handleAddToCart = () => {
		if (quantity <= product.maxAllowedInCart) {
			const productWithImage = {
				...product,
				image: product.image || product.imageUrls[0] || "/placeholder-image.png",
				imageUrls: product.imageUrls, // Ensure imageUrls is included
			};

			const toAddCart: CartItem = mapProductToCartItem(
				productWithImage,
				product.salonRefId, // Pass salonRefId if available
				undefined, // salonName
			);

			// Set quantity and selected variations
			toAddCart.quantity = quantity;
			toAddCart.selectedVariations = selectedVariations.map((v) => ({
				title: v.title,
				variationListItem: v.variationList[0] || "",
			}));

			addItem(toAddCart);
			toast.success("Added to cart!", {
				position: "top-right",
				duration: 2000,
			});
		} else {
			toast.error(`Maximum allowed quantity in cart is ${product.maxAllowedInCart}`, {
				position: "top-right",
				duration: 2000,
			});
		}
	};

	const handleVariationSelect = (variationTitle: string, option: string) => {
		setSelectedVariations((prev) => {
			const existingVariation = prev.find((v) => v.title === variationTitle);
			if (existingVariation) {
				return prev.map((v) =>
					v.title === variationTitle
						? { title: variationTitle, variationList: [option] }
						: v
				);
			}
			return [...prev, { title: variationTitle, variationList: [option] }];
		});
	};

	const handlePrevImage = () => {
		setCurrentImageIndex((prev) =>
			prev === 0 ? product.imageUrls.length - 1 : prev - 1
		);
	};

	const handleNextImage = () => {
		setCurrentImageIndex((prev) =>
			prev === product.imageUrls.length - 1 ? 0 : prev + 1
		);
	};

	return (
		<div className="px-2">
			<div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
						{/* Image Gallery with Animations */}
						<div className="relative bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-2xl animate-slide-in-left">
							{product.imageUrls && product.imageUrls.length > 0 ? (
								<>
									<div className="relative overflow-hidden rounded-lg">
										<img
											src={product.imageUrls[currentImageIndex]}
											alt={product.title}
											className="w-full h-96 object-cover rounded-lg transform transition-transform duration-500 hover:scale-110"
										/>
									</div>
									<div className="mt-6 flex gap-4 justify-center flex-wrap">
										{product.imageUrls.map((img, index) => (
											<img
												key={index}
												src={img}
												alt={`${product.title} thumbnail ${index + 1}`}
												className={`w-20 h-25 object-cover rounded-md cursor-pointer transition-all duration-200 ${index === currentImageIndex
													? "border-4 border-primary ring-2 ring-primary"
													: "opacity-70 hover:opacity-100 hover:ring-2 hover:ring-primary hover:animate-bounce"
													}`}
												onClick={() => setCurrentImageIndex(index)}
											/>
										))}
									</div>
									{product.imageUrls.length > 1 && (
										<div className="mt-4 flex justify-center gap-4">
											<button
												onClick={handlePrevImage}
												className="btn btn-circle btn-sm bg-primary text-white hover:bg-primary-dark transition-all duration-200 transform hover:scale-110 active:scale-95 animate-spin-slow"
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left-circle-fill" viewBox="0 0 16 16">
													<path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
												</svg>
											</button>
											<button
												onClick={handleNextImage}
												className="btn btn-circle btn-sm bg-primary text-white hover:bg-primary-dark transition-all duration-200 transform hover:scale-110 active:scale-95 animate-spin-slow"
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right-circle-fill" viewBox="0 0 16 16">
													<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
												</svg>
											</button>
										</div>
									)}
								</>
							) : (
								<div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
									<p className="text-gray-500">No Image Available</p>
								</div>
							)}
						</div>

						{/* Product Info */}
						<div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-2xl animate-slide-in-right">
							<h1 className="text-4xl font-bold text-gray-900 mb-4">
								{product.title}
							</h1>
							<div className="flex items-center gap-4 mb-6">
								<div className="flex items-center gap-1">
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className={`w-5 h-5 ${i < 4 // Hardcoded rating to 4
												? "text-yellow-400 fill-current"
												: "text-gray-300"
												}`}
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
								<span className="text-gray-600 font-medium">4 Rating</span>
								<span className="text-green-600 font-semibold">
									{product.stockStatus || product.status || "In Stock"}
								</span>
							</div>

							<div className="flex items-center gap-4 mb-6">
								<span className="text-lg font-medium">Quantity</span>
								<button
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
									className="btn btn-circle btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-200 transform hover:scale-110 active:scale-90"
								>
									-
								</button>
								<span className="text-xl font-bold">{quantity}</span>
								<button
									onClick={() =>
										setQuantity(Math.min(quantity + 1, product.maxAllowedInCart))
									}
									className="btn btn-circle btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-200 transform hover:scale-110 active:scale-90"
								>
									+
								</button>
							</div>

							<div className="mb-6">
								<span className="text-3xl font-bold text-gray-900">
									{product.discountedPrice?.toFixed(2) || product.price.toFixed(2)}{" "}
									<span className="text-lg font-medium">PKR</span>
								</span>
								{product.discountPercent && (
									<span className="ml-2 text-red-600 line-through text-lg">
										{product.price.toFixed(2)} PKR
									</span>
								)}
								{product.discountPercent && (
									<span className="ml-2 text-green-600 font-semibold">
										-{product.discountPercent}%
									</span>
								)}
							</div>

							<button
								onClick={handleAddToCart}
								className="relative w-full btn btn-primary bg-primary text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 overflow-hidden"
							>
								Add to Cart
							</button>

							<p
								className="mt-4 text-center text-lg font-semibold text-primary hover:text-primary-dark cursor-pointer transition-all duration-300 transform hover:scale-110 hover:underline underline-offset-4 animate-pulse-custom"
								onClick={() =>
									(document.getElementById("bulk-buy-modal") as HTMLDialogElement)?.showModal()
								}
							>
								Bulk Buy & Save Big!
							</p>

							<dialog id="bulk-buy-modal" className="modal modal-middle">
								<div className="modal-box bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 max-w-md w-full animate-slide-up">
									<h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
										Bulk Order Benefits!
									</h3>
									<p className="text-gray-600 mb-6 leading-relaxed">
										Place a bulk order with SalonSphere and enjoy{" "}
										<span className="font-semibold text-primary">exclusive discounts</span>! Contact us to confirm your order and unlock amazing savings on your favorite products.
									</p>
									<div className="flex items-center justify-center mb-6">
										<button
											className="btn btn-secondary bg-[#25D366] hover:bg-[#20C35B] text-white font-semibold py-3 px-6 rounded-full flex items-center gap-3 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
											onClick={() => {
												window.open(
													"https://wa.me/923192590810?text=Hi! I'm interested in placing a bulk order with SalonSphere.",
													"_blank"
												);
												toast.success("Opening WhatsApp!", {
													position: "top-right",
													duration: 2000,
												});
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												fill="currentColor"
												className="bi bi-whatsapp"
												viewBox="0 0 16 16"
											>
												<path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
											</svg>
											Contact via WhatsApp
										</button>
									</div>
									<div className="modal-action flex justify-end">
										<button
											className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium py-2 px-5 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
											onClick={() =>
												(document.getElementById("bulk-buy-modal") as HTMLDialogElement)?.close()
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
							<div className="mt-6 space-y-4">
								<div
									tabIndex={0}
									className="collapse collapse-arrow bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:bg-gray-100"
								>
									<div className="collapse-title text-xl font-semibold text-gray-800">
										Product Details
									</div>
									<div className="collapse-content text-gray-600">
										<p>{product.description || "No description available"}</p>
									</div>
								</div>
								<div
									tabIndex={0}
									className="collapse collapse-arrow bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 hover:bg-gray-100"
								>
									<div className="collapse-title text-xl font-semibold text-gray-800">
										How to Use
									</div>
									<div className="collapse-content text-gray-600">
										<p>{product.howToUse || "No usage instructions available"}</p>
									</div>
								</div>
							</div>

							{product.variations.map((variation) => (
								<div key={variation.title} className="mt-6">
									<h3 className="text-lg font-semibold text-gray-800 mb-2">
										{variation.title}
									</h3>
									<div className="flex gap-2 flex-wrap">
										{variation.variationList.map((option) => (
											<button
												key={option}
												className={`btn btn-sm rounded-full text-sm ${selectedVariations.some(
													(v) =>
														v.title === variation.title &&
														v.variationList.includes(option)
												)
													? "btn-primary bg-primary text-white"
													: "btn-outline hover:bg-primary"
													} transition-all duration-200 transform hover:scale-105 active:scale-95`}
												onClick={() => handleVariationSelect(variation.title, option)}
											>
												{option}
											</button>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="mt-12">
					<HotDeals />
				</div>
			</div>
		</div>
	);
};

export default ProductDetail;