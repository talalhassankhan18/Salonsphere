// Maps a salon as returned by /api/salon and /api/salon/nearby onto the
// SalonCardType that <CardList dataType="salon"> renders. Client-safe.

import type { SalonCardType } from "../../types";

/** Shown when a salon has no avatar. `/default-salon-image.jpg` never existed. */
export const SALON_FALLBACK_IMAGE = "/placeholder.svg";

export interface ApiSalon {
  _id: string;
  salonName?: string;
  name?: string;
  address?: string;
  avatar?: string;
  ratings?: number;
  createdAt?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function toSalonCard(salon: ApiSalon): SalonCardType {
  return {
    _id: salon._id,
    name: salon.salonName || salon.name || "Unnamed Salon",
    address: salon.address || "No address provided",
    image: salon.avatar || SALON_FALLBACK_IMAGE,
    ratings: typeof salon.ratings === "number" ? salon.ratings : 0,
  };
}

/** Newest registrations first; salons without a createdAt sort last. */
export function sortNewestFirst<T extends { createdAt?: string }>(salons: T[]): T[] {
  return [...salons].sort(
    (a, b) =>
      (b.createdAt ? Date.parse(b.createdAt) : 0) -
      (a.createdAt ? Date.parse(a.createdAt) : 0)
  );
}
