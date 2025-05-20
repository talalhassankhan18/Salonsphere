export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string; // Added category to match BackendService
  image?: string;
  gender: "men" | "women" | "unisex" | undefined;
  isActive: boolean;
}

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  capacityReached: boolean;
}
