export type SalonGender = "men" | "women" | "unisex";

export interface Salon {
  id: string;
  name: string;
  description: string;
  address: string;
  phone?: string;
  image: string;
  type: SalonGender;
  /** How many clients the salon can serve in the same slot. */
  capacity: number;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category?: string; // Matches BackendService when loaded from the API
  image?: string;
  gender: SalonGender | undefined;
  isActive?: boolean;
}

export interface Review {
  id: string;
  serviceId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  capacityReached: boolean;
  /** Number of bookings already taken for this slot (mock data only). */
  bookedCount?: number;
}
