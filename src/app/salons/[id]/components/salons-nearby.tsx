import CardList from "@/common/card-list";
import { SalonsData } from "@/data";
import { SalonCardType } from "../../../../../types";
import Link from "next/link";
import React from "react";

interface SalonsNearbyProps {
  currentSalonAddress?: string;
}

const SalonsNearby = ({ currentSalonAddress }: SalonsNearbyProps) => {
  const allSalons: SalonCardType[] = SalonsData;

  const nearbySalons = allSalons.filter((salon) => {
    return salon.address === currentSalonAddress; // Filter condition
  });

  return (
    <div className="px-2 mb-4 md:mb-8">
      <Link href="/salons" className="prose lg:prose-xl">
        <h2 className="mb-2 md:mb-3">Nearby Salons</h2>
      </Link>
      {nearbySalons.length > 0 ? (
        <CardList cards={nearbySalons} dataType="salon" shouldAnimate={true} />
      ) : (
        <p className="prose lg:prose-xl">No nearby salons found.</p>
      )}
    </div>
  );
};

export default SalonsNearby;
