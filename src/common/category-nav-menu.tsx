"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { FaSortDown } from "react-icons/fa";

// categoriesData.ts
export const categories = [
	{ name: "MAKE UP", items: ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"] },
	{ name: "SKIN CARE", items: ["Item 6", "Item 7", "Item 8", "Item 9", "Item 10"] },
	{ name: "FRAGRANCE", items: ["Item 11", "Item 12", "Item 13", "Item 14", "Item 15"] },
	{ name: "HAIR CARE", items: ["Item 16", "Item 17", "Item 18", "Item 19", "Item 20"] },
	{ name: "WATCHES", items: ["Item 21", "Item 22", "Item 23", "Item 24", "Item 25"] },
	{ name: "FASHION", items: ["Item 26", "Item 27", "Item 28", "Item 29", "Item 30"] },
];

const CategoryNavMenu = ({ className }: { className?: string }) => {
	const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);

	const handleMouseEnter = (categoryName: string) => setHoveredCategory(categoryName);
	const handleMouseLeave = () => setHoveredCategory(null);
	const handleMobileMenuToggle = (categoryName: string) => setMobileMenuOpen((prev) => (prev === categoryName ? null : categoryName));

	return (
		<nav className={cn("bg-[#282A36] border-b sticky top-[60px] z-40 shadow-md", className)}>
			<div className="container mx-auto">
				{/* Desktop View */}
				<div className="hidden sm:flex justify-center space-x-4 p-2">
					{categories.map((category) => (
						<div key={category.name} className="relative" onMouseEnter={() => handleMouseEnter(category.name)} onMouseLeave={handleMouseLeave}>
							<button className={cn("px-4 py-3 text-white text-sm font-medium transition duration-150 hover:text-primary", hoveredCategory === category.name && "text-primary")}>
								{category.name}
								<FaSortDown className={cn("text-xs ml-1 transition-transform", hoveredCategory === category.name ? "-rotate-180" : "rotate-0")} />
							</button>
							{hoveredCategory === category.name && (
								<div className="absolute bg-[#282A36] shadow-lg border border-gray-100 rounded-lg z-40 w-[150px] py-2 mt-1">
									{category.items.map((item, index) => (
										<a key={index} href="#" className="block px-4 py-1.5 text-xs text-white hover:bg-gray-700 transition">
											{item}
										</a>
									))}
								</div>
							)}
						</div>
					))}
				</div>

				{/* Mobile View */}
				<div className="sm:hidden flex flex-col">
					{categories.map((category) => (
						<div key={category.name} className="relative">
							<button className="w-full text-left px-4 py-2 text-sm text-white font-medium flex justify-between items-center" onClick={() => handleMobileMenuToggle(category.name)}>
								{category.name}
								<FaSortDown className={cn("text-xs transition-transform", mobileMenuOpen === category.name ? "-rotate-180" : "rotate-0")} />
							</button>
							{mobileMenuOpen === category.name && (
								<div className="bg-[#282A36] shadow-lg border border-gray-100 rounded-lg z-40 w-full mt-1">
									{category.items.map((item, index) => (
										<a key={index} href="#" className="block px-4 py-1.5 text-xs text-white hover:bg-gray-700 transition">
											{item}
										</a>
									))}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</nav>
	);
};

export default CategoryNavMenu;
