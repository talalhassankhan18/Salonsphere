"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MapComponent = dynamic(() => import("@/common/MapComponent"), {
  ssr: false,
});

type Salon = {
  name: string;
  latitude: number;
  longitude: number;
};

export default function MapPage() {
  const [salons, setSalons] = useState<Salon[]>([]);

  useEffect(() => {
    fetch("/api/salon")
      .then((res) => res.json())
      .then((data) => setSalons(data))
      .catch((err) => console.error("Error fetching salons:", err));
  }, []);

  return (
    <div>
      <h1>Salon Locations</h1>
      {salons.length > 0 ? (
        <MapComponent salons={salons} />
      ) : (
        <p>Loading salons...</p>
      )}
    </div>
  );
}
