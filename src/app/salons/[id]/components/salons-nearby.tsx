"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CardList from "@/common/card-list";
import { SalonCardType } from "../../../../../types";
import { ApiSalon, sortNewestFirst, toSalonCard } from "@/lib/salon-cards";

interface SalonsNearbyProps {
  currentSalonId: string;
  latitude?: number | null;
  longitude?: number | null;
}

const NEARBY_LIMIT = 4;
const NEARBY_RADIUS_METERS = 10_000;

// Other registered salons near this one. Uses /api/salon/nearby (Haversine)
// when the current salon has coordinates; otherwise falls back to the newest
// registered salons so the section is never stuck on mock data.
const SalonsNearby = ({ currentSalonId, latitude, longitude }: SalonsNearbyProps) => {
  const [salons, setSalons] = useState<SalonCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasCoords = typeof latitude === "number" && typeof longitude === "number";

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const url = hasCoords
          ? `/api/salon/nearby?lat=${latitude}&lng=${longitude}&distance=${NEARBY_RADIUS_METERS}&excludeId=${currentSalonId}`
          : "/api/salon";
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to fetch nearby salons (${res.status})`);
        const data: ApiSalon[] = await res.json();
        const others = data.filter((s) => s._id !== currentSalonId);
        const ordered = hasCoords ? others : sortNewestFirst(others);
        setSalons(ordered.slice(0, NEARBY_LIMIT).map(toSalonCard));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error("Error fetching nearby salons:", err);
        setSalons([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [currentSalonId, latitude, longitude, hasCoords]);

  return (
    <div className="px-2 mb-4 md:mb-8">
      <Link href="/salons" className="prose lg:prose-xl">
        <h2 className="mb-2 md:mb-3">{hasCoords ? "Nearby Salons" : "Other Salons"}</h2>
      </Link>
      {isLoading ? (
        <p className="prose lg:prose-xl text-gray-600">Loading salons...</p>
      ) : salons.length > 0 ? (
        <CardList cards={salons} dataType="salon" shouldAnimate={true} />
      ) : (
        <p className="prose lg:prose-xl">No nearby salons found.</p>
      )}
    </div>
  );
};

export default SalonsNearby;
