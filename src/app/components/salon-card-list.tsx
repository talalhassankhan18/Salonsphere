"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CardList from "@/common/card-list";
import { SalonCardType } from "../../../types";
import { ApiSalon, sortNewestFirst, toSalonCard } from "@/lib/salon-cards";

/** How many salons the home page highlights; the heading links to the full list. */
const HOME_SALON_LIMIT = 8;

const Heading = () => (
	<Link href={"/salons"} className="prose lg:prose-xl">
		<h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
			<span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
			<span className="pl-4">Salons</span>
		</h3>
	</Link>
);

// Registered salons (verified + paid, as filtered by /api/salon), newest first.
const SalonCardList = () => {
	const [salons, setSalons] = useState<SalonCardType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();

		(async () => {
			try {
				const res = await fetch("/api/salon", { signal: controller.signal });
				if (!res.ok) throw new Error(`Failed to fetch salons (${res.status})`);
				const data: ApiSalon[] = await res.json();
				setSalons(sortNewestFirst(data).slice(0, HOME_SALON_LIMIT).map(toSalonCard));
			} catch (err) {
				if ((err as Error).name === "AbortError") return;
				console.error("Error fetching salons:", err);
				setError("Failed to load salons. Please try again later.");
			} finally {
				if (!controller.signal.aborted) setIsLoading(false);
			}
		})();

		return () => controller.abort();
	}, []);

	return (
		<div className="px-2">
			<Heading />
			{isLoading ? (
				<div className="flex justify-center items-center h-40 mb-6 md:mb-8">
					<p className="text-gray-600">Loading salons...</p>
				</div>
			) : error ? (
				<div className="flex justify-center items-center h-40 mb-6 md:mb-8">
					<p className="text-red-600">{error}</p>
				</div>
			) : salons.length === 0 ? (
				<div className="flex justify-center items-center h-40 mb-6 md:mb-8">
					<p className="text-gray-600">No salons registered yet.</p>
				</div>
			) : (
				<CardList cards={salons} dataType="salon" shouldAnimate={true} />
			)}
		</div>
	);
};

export default SalonCardList;
