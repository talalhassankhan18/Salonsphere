import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
	AreaType,
	CardType,
	ProductType,
	ReviewType,
	SalonType,
} from "@/types";
import { FaRegStar, FaStar } from "react-icons/fa";
import AddToCartBtn from "@/app/selfcare-products/components/add-to-cart-btn";
import CardImage from "@/app/selfcare-products/components/card-image";
import FakeReview from "@/app/components/reviews-fake";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function trimString(str: string, max = 40) {
	return str.length > max ? `${str.slice(0, max)}...` : str;
}

export function mapProducts(Products: ProductType[]): CardType[] {
	return Products.map((item) => ({
		border: true,
		image: (
			<CardImage route={`/selfcare-products/${item._id}`} src={item.image} />
		),
		bgColor: "white",
		top: {
			left: (
				<p className="text-nowrap text-lg text-neutral">
					{trimString(item.title, 20)}
				</p>
			),
			right: (
				<div className="flex items-center">
					<FaStar className="mr-1 mb-1 size-4 text-primary" />
					<span className=" text-neutral">{item.rating}</span>
				</div>
			),
		},
		bottom: {
			left: item.discountPercent ? (
				<div className="flex items-center">
					<p className="text-[#878683] text-sm">
						<del>{item.price}</del>
					</p>
					&nbsp;
					<p className="text-base-content text-md">
						{Math.floor(item.price * (100 - item.discountPercent) * 0.01)} PKR
					</p>
				</div>
			) : (
				<p className="text-base-content">{item.price} PKR</p>
			),
			right: item.discountPercent ? (
				<p className="text-success">{item.discountPercent}% off</p>
			) : null,
		},
		actionBtn: {
			full: <AddToCartBtn product={item} />,
		},
	}));
}

export function mapSalons(salonsExample: SalonType[]): CardType[] {
	return salonsExample.map((salon) => ({
		top: {
			left: <h2 className="font-bold text-2xl text-base-100">{salon.name}</h2>,
			right: (
				<span className="flex items-center text-base-100">
					<FaRegStar /> &nbsp; {salon.rating}
				</span>
			),
		},
		bottom: {
			left: <p className="text-base-100 text-sm">{salon.address}</p>,
		},
		actionBtn: {
			right: (
				<button className="btn btn-base bg-base-100 text-base-content capitalize">
					Book Now
				</button>
			),
		},
		image: <CardImage route={`/salons/${salon.name}`} src={salon.image} />,
		bgColor: "secondary",
	}));
}

export function mapAreas(areas: AreaType[]): CardType[] {
	return areas.map((a, i) => ({
		top: {
			full: (
				<div key={i} className="">
					<div>
						<div className="mb-2 font-bold text-xl">{a.city}</div>
						{[...Array(a.salons.length)].map((_, index) => (
							<p key={index} className="mb-1 text-[#878683] leading-6">
								{a.salons[index]}
							</p>
						))}
					</div>
				</div>
			),
		},
		actionBtn: {},
		image: null,
		bgColor: "white",
	}));
}

export function mapReviews(review: ReviewType[]): CardType[] {
	return review.map((r, i) => ({
		top: {
			full: <FakeReview key={i} review={r} />,
		},
		actionBtn: {},
		image: null,
		bgColor: "base-300",
	}));
}

export async function fetchVendor() {
	try {
	  const res = await fetch("/api/vendor");
	  console.log(res);
	  if (!res.ok) throw new Error("Failed to fetch vendor data");
	
  
	  const data = await res.json();
	  
	  return data;
	} catch (error) {
	  console.error("Error fetching vendor:", error);
	  return null;
	}
  }
  
  
