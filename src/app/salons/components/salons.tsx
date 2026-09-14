"use client";
import React from "react";
import CardList from "@/common/card-list";
import Link from "next/link";
import { SalonType } from "../../../../types";

interface SalonsProps {
  salons: SalonType[];
  isLoading: boolean;
  error: string | null;
}

const Salons = ({ salons, isLoading, error }: SalonsProps) => {
  if (isLoading) {
    return (
      <div className="px-2">
        <Link href="/salons" className="prose lg:prose-xl">
          <h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
            <span className="pl-4">Salons</span>
          </h3>
        </Link>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-600">Loading salons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-2">
        <Link href="/salons" className="prose lg:prose-xl">
          <h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
            <span className="pl-4">Salons</span>
          </h3>
        </Link>
        <div className="flex justify-center items-center h-40">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (salons.length === 0) {
    return (
      <div className="px-2">
        <Link href="/salons" className="prose lg:prose-xl">
          <h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
            <span className="pl-4">Salons</span>
          </h3>
        </Link>
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-600">No salons available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2">
      <Link href="/salons" className="prose lg:prose-xl">
        <h3 className="mb-2 md:mb-3 relative text-secondary font-semibold text-lg bg-base-100">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-sm"></span>
          <span className="pl-4">Salons</span>
        </h3>
      </Link>
      <CardList cards={salons} dataType="salon" shouldAnimate={true} />
    </div>
  );
};

export default Salons;
