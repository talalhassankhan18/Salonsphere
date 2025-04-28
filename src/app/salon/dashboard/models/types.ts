
// Model Types

export interface Salon {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  description: string;
  profileImage: string;
  coverImage: string;
  businessHours: BusinessHours;
  services: Service[];
  products: ProductListing[];
  appointments: Appointment[];
  reviews: Review[];
  portfolio: PortfolioItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string; // Hashed password
  role: 'admin' | 'salon_admin' | 'customer';
  salon?: string; // Reference to salon for salon admins
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  monday: { open: string; close: string; isOpen: boolean };
  tuesday: { open: string; close: string; isOpen: boolean };
  wednesday: { open: string; close: string; isOpen: boolean };
  thursday: { open: string; close: string; isOpen: boolean };
  friday: { open: string; close: string; isOpen: boolean };
  saturday: { open: string; close: string; isOpen: boolean };
  sunday: { open: string; close: string; isOpen: boolean };
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  salon: string; // Reference to salon
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListing {
  _id: string;
  product: Product;
  salon: string; // Reference to salon
  discount?: number; // Percentage discount
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  _id: string;
  customer: User;
  salon: string; // Reference to salon
  service: Service;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  customer: User;
  salon: string; // Reference to salon
  products: OrderItem[];
  totalAmount: number;
  commissionAmount: number; // 5% of totalAmount
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  shippingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  discount?: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Review {
  _id: string;
  customer: User;
  salon: string; // Reference to salon
  service?: Service;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioItem {
  _id: string;
  salon: string; // Reference to salon
  title: string;
  description?: string;
  image: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Commission {
  _id: string;
  salon: string; // Reference to salon
  order: Order;
  amount: number;
  status: 'pending' | 'paid';
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data generators
export const generateMockSalon = (): Salon => ({
  _id: `salon_${Math.random().toString(36).substr(2, 9)}`,
  name: "Elegance Beauty Salon",
  address: "123 Main Street",
  city: "San Francisco",
  state: "CA",
  zipCode: "94105",
  phone: "(415) 555-1234",
  email: "contact@elegancebeauty.com",
  description: "Luxury beauty salon offering premium services for hair, skin, and nails.",
  profileImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
  coverImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
  businessHours: {
    monday: { open: "09:00", close: "18:00", isOpen: true },
    tuesday: { open: "09:00", close: "18:00", isOpen: true },
    wednesday: { open: "09:00", close: "18:00", isOpen: true },
    thursday: { open: "09:00", close: "18:00", isOpen: true },
    friday: { open: "09:00", close: "20:00", isOpen: true },
    saturday: { open: "10:00", close: "16:00", isOpen: true },
    sunday: { open: "00:00", close: "00:00", isOpen: false },
  },
  services: [],
  products: [],
  appointments: [],
  reviews: [],
  portfolio: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

export const generateMockServices = (): Service[] => [
  {
    _id: `service_${Math.random().toString(36).substr(2, 9)}`,
    name: "Classic Haircut",
    description: "Precision haircut tailored to your style and preferences.",
    duration: 45,
    price: 45,
    category: "Hair",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    salon: "salon_123",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: `service_${Math.random().toString(36).substr(2, 9)}`,
    name: "Deluxe Manicure",
    description: "Comprehensive nail care with premium polish application.",
    duration: 60,
    price: 35,
    category: "Nails",
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    salon: "salon_123",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: `service_${Math.random().toString(36).substr(2, 9)}`,
    name: "Rejuvenating Facial",
    description: "Deep cleansing facial with premium skincare products.",
    duration: 75,
    price: 65,
    category: "Skin",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    isActive: true,
    salon: "salon_123",
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

export const generateMockAppointments = (): Appointment[] => {
  const today = new Date();
  
  return [
    {
      _id: `appt_${Math.random().toString(36).substr(2, 9)}`,
      customer: {
        _id: "user_123",
        name: "Jane Smith",
        email: "jane@example.com",
        password: "hashed_password",
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      salon: "salon_123",
      service: generateMockServices()[0],
      startTime: new Date(today.setHours(10, 0, 0, 0)),
      endTime: new Date(today.setHours(10, 45, 0, 0)),
      status: "confirmed",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: `appt_${Math.random().toString(36).substr(2, 9)}`,
      customer: {
        _id: "user_456",
        name: "Michael Johnson",
        email: "michael@example.com",
        password: "hashed_password",
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      salon: "salon_123",
      service: generateMockServices()[1],
      startTime: new Date(today.setHours(13, 0, 0, 0)),
      endTime: new Date(today.setHours(14, 0, 0, 0)),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: `appt_${Math.random().toString(36).substr(2, 9)}`,
      customer: {
        _id: "user_789",
        name: "Emily Williams",
        email: "emily@example.com",
        password: "hashed_password",
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      salon: "salon_123",
      service: generateMockServices()[2],
      startTime: new Date(today.setHours(15, 30, 0, 0)),
      endTime: new Date(today.setHours(16, 45, 0, 0)),
      status: "confirmed",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
};

export const generateMockProducts = (): Product[] => [
  {
    _id: `product_${Math.random().toString(36).substr(2, 9)}`,
    name: "Hydrating Shampoo",
    description: "Premium hydrating shampoo for all hair types.",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1556227834-09f1de5c3a29?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Hair Care",
    stock: 45,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: `product_${Math.random().toString(36).substr(2, 9)}`,
    name: "Nourishing Conditioner",
    description: "Deep nourishing conditioner for damaged hair.",
    price: 22.99,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Hair Care",
    stock: 38,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: `product_${Math.random().toString(36).substr(2, 9)}`,
    name: "Anti-Aging Face Serum",
    description: "Advanced anti-aging serum with hyaluronic acid.",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Skin Care",
    stock: 22,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const generateMockOrders = (): Order[] => [
  {
    _id: `order_${Math.random().toString(36).substr(2, 9)}`,
    customer: {
      _id: "user_123",
      name: "Jane Smith",
      email: "jane@example.com",
      password: "hashed_password",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    salon: "salon_123",
    products: [
      {
        product: generateMockProducts()[0],
        quantity: 1,
        price: 24.99,
      },
      {
        product: generateMockProducts()[1],
        quantity: 1,
        price: 22.99,
      }
    ],
    totalAmount: 47.98,
    commissionAmount: 2.40, // 5% of totalAmount
    status: "processing",
    paymentStatus: "paid",
    shippingAddress: {
      street: "456 Oak Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
      country: "USA"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: `order_${Math.random().toString(36).substr(2, 9)}`,
    customer: {
      _id: "user_456",
      name: "Michael Johnson",
      email: "michael@example.com",
      password: "hashed_password",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    salon: "salon_123",
    products: [
      {
        product: generateMockProducts()[2],
        quantity: 2,
        price: 49.99,
        discount: 10
      }
    ],
    totalAmount: 89.98,
    commissionAmount: 4.50, // 5% of totalAmount
    status: "delivered",
    paymentStatus: "paid",
    shippingAddress: {
      street: "789 Pine Avenue",
      city: "San Francisco",
      state: "CA",
      zipCode: "94109",
      country: "USA"
    },
    trackingNumber: "TRK123456789",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 5))
  }
];

export const generateMockReviews = (): Review[] => [
  {
    _id: `review_${Math.random().toString(36).substr(2, 9)}`,
    customer: {
      _id: "user_123",
      name: "Jane Smith",
      email: "jane@example.com",
      password: "hashed_password",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    salon: "salon_123",
    service: generateMockServices()[0],
    rating: 5,
    comment: "Absolutely loved my haircut! The stylist understood exactly what I wanted.",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 14)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 14))
  },
  {
    _id: `review_${Math.random().toString(36).substr(2, 9)}`,
    customer: {
      _id: "user_456",
      name: "Michael Johnson",
      email: "michael@example.com",
      password: "hashed_password",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    salon: "salon_123",
    service: generateMockServices()[1],
    rating: 4,
    comment: "Great manicure, very detailed work. Took a bit longer than expected.",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 7))
  },
  {
    _id: `review_${Math.random().toString(36).substr(2, 9)}`,
    customer: {
      _id: "user_789",
      name: "Emily Williams",
      email: "emily@example.com",
      password: "hashed_password",
      role: "customer",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    salon: "salon_123",
    service: generateMockServices()[2],
    rating: 5,
    comment: "The facial was so relaxing and my skin looks amazing! Will definitely return.",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 3))
  }
];

export const generateMockCommissions = (): Commission[] => [
  {
    _id: `commission_${Math.random().toString(36).substr(2, 9)}`,
    salon: "salon_123",
    order: generateMockOrders()[0],
    amount: 2.40,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: `commission_${Math.random().toString(36).substr(2, 9)}`,
    salon: "salon_123",
    order: generateMockOrders()[1],
    amount: 4.50,
    status: "paid",
    paymentDate: new Date(new Date().setDate(new Date().getDate() - 3)),
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 3))
  }
];

export const generateMockPortfolioItems = (): PortfolioItem[] => [
  {
    _id: `portfolio_${Math.random().toString(36).substr(2, 9)}`,
    salon: "salon_123",
    title: "Modern Bob Cut",
    description: "Contemporary bob haircut with subtle layers for added volume.",
    image: "https://images.unsplash.com/photo-1554519515-242161756769?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Hair",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 30))
  },
  {
    _id: `portfolio_${Math.random().toString(36).substr(2, 9)}`,
    salon: "salon_123",
    title: "French Manicure",
    description: "Classic French manicure with a modern twist.",
    image: "https://images.unsplash.com/photo-1612830457201-446ce80ee6d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Nails",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 21)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 21))
  },
  {
    _id: `portfolio_${Math.random().toString(36).substr(2, 9)}`,
    salon: "salon_123",
    title: "Bridal Makeup",
    description: "Elegant bridal makeup for a summer wedding.",
    image: "https://images.unsplash.com/photo-1634038971202-c1e256a11896?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "Makeup",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 14)),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 14))
  }
];
