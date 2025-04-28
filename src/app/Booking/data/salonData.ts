import { Service, Review, TimeSlot, Salon } from "@/app/Booking/types/booking";

// Salon data
export const salons: Salon[] = [
  {
    id: "salon1",
    name: "Gentlemen's Grooming",
    description: "Exclusive salon for men with premium grooming services",
    address: "123 Main St, Anytown",
    phone: "123-456-7890",
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop",
    type: "men",
    capacity: 3, // Can serve 3 clients at once
  },
  {
    id: "salon2",
    name: "Ladies' Paradise",
    description: "Luxury beauty treatments for women",
    address: "456 Oak Ave, Anytown",
    phone: "123-456-7891",
    image:
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=2070&auto=format&fit=crop",
    type: "women",
    capacity: 4, // Can serve 4 clients at once
  },
  {
    id: "salon3",
    name: "Unisex Style Studio",
    description: "Premium styling for everyone",
    address: "789 Pine Blvd, Anytown",
    phone: "123-456-7892",
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop",
    type: "unisex",
    capacity: 5, // Can serve 5 clients at once
  },
];

// Services data with salonId added
export const services: Service[] = [
  {
    id: "mens-haircut",
    name: "Men's Haircut",
    description:
      "Expert styling tailored to your face shape and personal style.",
    duration: 45,
    price: 65,
    image:
      "https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=2070&auto=format&fit=crop",
    gender: "men",
    salonId: "salon1",
  },
  {
    id: "mens-beard-trim",
    name: "Beard Trim & Shape",
    description: "Professional beard grooming and styling.",
    duration: 30,
    price: 35,
    image:
      "https://images.unsplash.com/photo-1622296089863-eb7fc530daa9?q=80&w=2070&auto=format&fit=crop",
    gender: "men",
    salonId: "salon1",
  },
  {
    id: "womens-haircut",
    name: "Women's Haircut",
    description: "Professional cut and style for any hair length.",
    duration: 60,
    price: 90,
    image:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2071&auto=format&fit=crop",
    gender: "women",
    salonId: "salon2",
  },
  {
    id: "color",
    name: "Hair Color Treatment",
    description:
      "Vibrant, long-lasting color using premium products for healthy hair.",
    duration: 120,
    price: 120,
    image:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2071&auto=format&fit=crop",
    gender: "women",
    salonId: "salon2",
  },
  {
    id: "unisex-haircut",
    name: "Unisex Haircut",
    description: "Professional haircut suitable for all genders.",
    duration: 60,
    price: 75,
    image:
      "https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=2070&auto=format&fit=crop",
    gender: "unisex",
    salonId: "salon3",
  },
  {
    id: "blowout",
    name: "Blowout & Style",
    description: "Professional blow dry and styling for any occasion.",
    duration: 45,
    price: 65,
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1976&auto=format&fit=crop",
    gender: "unisex",
    salonId: "salon3",
  },
  {
    id: "facial",
    name: "Signature Facial",
    description:
      "Customized facial treatment to rejuvenate and nourish your skin.",
    duration: 90,
    price: 110,
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop",
    gender: "unisex",
    salonId: "salon3",
  },
];

export const reviews: Review[] = [
  {
    id: "rev1",
    serviceId: "haircut",
    customerName: "Emma Wilson",
    rating: 5,
    comment:
      "Absolutely loved my haircut! The stylist listened to exactly what I wanted and delivered perfection.",
    date: "2023-11-15",
  },
  {
    id: "rev2",
    serviceId: "haircut",
    customerName: "Michael Chen",
    rating: 4,
    comment: "Great service and attention to detail. Will definitely return!",
    date: "2023-10-22",
  },
  {
    id: "rev3",
    serviceId: "color",
    customerName: "Sophia Martinez",
    rating: 5,
    comment:
      "The color came out exactly as I hoped. My stylist was incredibly knowledgeable and helped me choose the perfect shade.",
    date: "2023-11-05",
  },
  {
    id: "rev4",
    serviceId: "blowout",
    customerName: "James Johnson",
    rating: 5,
    comment:
      "Quick service without sacrificing quality. My hair looked amazing for my event!",
    date: "2023-10-30",
  },
  {
    id: "rev5",
    serviceId: "facial",
    customerName: "Olivia Thompson",
    rating: 4,
    comment: "Such a relaxing experience! My skin felt amazing afterward.",
    date: "2023-11-10",
  },
];

// Mock bookings for capacity management demonstration
const mockBookings = [
  { slotTime: "10:00", count: 2 }, // 2 bookings at 10:00
  { slotTime: "11:30", count: 3 }, // 3 bookings at 11:30 (full for some salons)
  { slotTime: "13:45", count: 2 }, // 2 bookings at 13:45
  { slotTime: "15:00", count: 4 }, // 4 bookings at 15:00 (full for most salons)
  { slotTime: "16:30", count: 1 }, // 1 booking at 16:30
  { slotTime: "19:00", count: 3 }, // 3 bookings at 19:00
  { slotTime: "20:15", count: 2 }, // 2 bookings at 20:15
];

// Update time slots generation for new working hours: 10 AM to 10 PM
export const generateTimeSlots = (
  date: Date,
  selectedSalon?: Salon | null
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const openingHour = 10; // 10 AM
  const closingHour = 22; // 10 PM

  const salonCapacity = selectedSalon?.capacity || 3; // Default capacity if not specified

  // Completely booked slots (no one can book)
  const fullyBookedSlots = ["12:15", "14:30", "21:00"];

  for (let hour = openingHour; hour < closingHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour}:${minute === 0 ? "00" : minute}`;

      // Check if this slot is in fully booked list
      const isFullyBooked = fullyBookedSlots.includes(timeString);

      // Find if there are any bookings for this slot
      const booking = mockBookings.find((b) => b.slotTime === timeString);
      const bookedCount = booking ? booking.count : 0;

      // Check if capacity is reached based on the selected salon
      const capacityReached = bookedCount >= salonCapacity;

      slots.push({
        id: `${date.toISOString().split("T")[0]}-${timeString}`,
        time: timeString,
        isAvailable: !isFullyBooked,
        bookedCount,
        capacityReached,
      });
    }
  }

  return slots;
};

// Helper function to format time from 24h to 12h format
export const formatTime = (time: string): string => {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr);
  const minute = minuteStr;

  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
};

// Function to get services by salon ID and optionally filter by gender
export const getServicesBySalon = (salonId: string): Service[] => {
  return services.filter((service) => service.salonId === salonId);
};
