/**
 * ✅ Base API Response Type
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  error?: {
    code: string;
    details?: string;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * ✅ Product Related Types
 */
export interface ProductBase {
  _id: string;
  title: string;
  price: number;
  image: string;
  status: "active" | "inactive" | "out-of-stock";
  createdAt: string;
  updatedAt: string;
  imageUrls: string[];
}

export interface SelfcareItem extends ProductBase {
  subtitle?: string;
  discountPercent?: number;
  rating: number;
  category: string;
  tags?: string[];
}

export interface ProductVariation {
  title: string;
  variationList: string[];
  required?: boolean;
}

export interface ProductType extends ProductBase {
  subtitle: string;
  discountedPrice: number | null;
  rating: string | number;
  sold: number;
  description: string;
  howToUse: string;
  maxAllowedInCart: number;
  variations: ProductVariation[];
  customButtons?: React.ReactNode[];
  onImageClick?: () => void;
  salonRefId?: string;
  uniqueProductCode?: string;
  discountPercent?: number;
  inventory?: {
    stock: number;
    lowStockThreshold: number;
  };
  stock?: number; // Added for stock tracking
  stockStatus?: "In Stock" | "Out of Stock" | "Restocked"; // Added for frontend display
}

/**
 * ✅ Cart & Order Types
 */
export interface SelectedVariation {
  title: string;
  variationListItem: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  title: string;
  image?: string;
  price: number;
  netPrice: number;
  discountPercent?: number;
  maxAllowedInCart?: number;
  variations?: ProductVariation[];
  selectedVariations?: SelectedVariation[];
  description?: string;
  howToUse?: string;
  rating?: string | number;
  salonId?: string;
  salonName?: string;
  uniqueProductCode?: string;
}

export interface OrderItem {
  productId: string;
  salonId?: string;
  salonName?: string;
  uniqueProductCode?: string;
  quantity: number;
  priceAtPurchase: number;
  variations?: SelectedVariation[];
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: "card" | "cash" | "wallet";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * ✅ UI Component Types
 */
export interface CardSection {
  left?: React.ReactNode;
  right?: React.ReactNode;
  full?: React.ReactNode;
}

export interface CardType {
  top?: CardSection;
  middle?: React.ReactNode;
  bottom?: CardSection;
  actionBtn?: CardSection;
  image?: React.ReactNode;
  border?: boolean;
  hoverEffect?: boolean;
  bgColor?:
    | "primary"
    | "secondary"
    | "accent"
    | "black"
    | "white"
    | "neutral"
    | "base-100"
    | "base-200"
    | "base-300"
    | "transparent";
  className?: string;
}

export interface ProductCardType {
  id: string;
  title: string;
  price: number;
  iconCart: React.ReactNode;
  reviewText: string;
  actionBtnText: string;
  image: string;
  onAddToCart?: () => void;
  onQuickView?: () => void;
  className?: string;
}

export interface ProductCardBudgetFriendlyType extends ProductCardType {
  discountedPrice: number;
  flatOff: number;
  originalPrice?: number;
}

/**
 * ✅ Review & Rating Types
 */
export interface ReviewType {
  _id?: string;
  userId?: string;
  productId?: string;
  salonId?: string;
  stars: number;
  title: string;
  description: string;
  /** Single reviewer/avatar image (marketing cards). */
  image?: string;
  images?: string[];
  name: string;
  city: string;
  createdAt?: string;
  verifiedPurchase?: boolean;
  likes?: number;
  dislikes?: number;
}

export interface RatingSummary {
  average: number;
  totalReviews: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * ✅ Salon & Service Types
 */
export interface AreaType {
  _id?: string;
  salons: string[];
  city: string;
  state?: string;
  country?: string;
  postalCodes?: string[];
}

export interface SalonWorkingHours {
  day: string;
  openingTime: string;
  closingTime: string;
  isClosed: boolean;
}

export interface SalonType {
  avatar: string;
  salonName: string;
  latitude: any;
  longitude: any;
  _id: string;
  name: string;
  address: string;
  ratings: number;
  image: string;
  contact: {
    phone: string;
    email?: string;
  };
  location: {
    coordinates: [number, number];
    city: string;
    state: string;
    postalCode: string;
  };
  workingHours: SalonWorkingHours[];
  services: string[];
  gallery?: string[];
  amenities?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  salonType?: "female" | "male" | "unisex"; // Added for gender filtering
}

/**
 * Minimal salon shape needed to render a storefront card.
 * `SalonType` (full API object) is assignable to this.
 */
export interface SalonCardType {
  _id?: string;
  name: string;
  address: string;
  image: string;
  ratings?: number;
}

export interface Service {
  _id: string;
  salon: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image?: string;
  gender: "Unisex" | "Female" | "Male";
  isActive: boolean;
  requiresConsultation?: boolean;
  staff?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * ✅ Booking & Appointment Types
 */
export interface TimeSlot {
  _id: string;
  salon: string;
  staffId?: string;
  serviceId?: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  salon: string;
  service: string;
  user: string;
  staff?: string;
  startTime: string;
  endTime: string;
  duration: number;
  paymentOption: "full" | "half" | "cash" | "card" | "wallet";
  amountPaid: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no-show";
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ✅ Media & Gallery Types
 */
export interface GalleryImage {
  _id: string;
  salon: string;
  imageUrl: string;
  caption?: string;
  category?: "service" | "salon" | "staff" | "other";
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MediaAsset {
  _id: string;
  url: string;
  type: "image" | "video";
  thumbnail?: string;
  altText?: string;
  tags?: string[];
  uploadedBy: string;
  createdAt: string;
}

/**
 * ✅ User & Auth Types
 */
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses?: {
    type: "home" | "work" | "other";
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }[];
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    theme: "light" | "dark" | "system";
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * ✅ Notification Types
 */
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "booking" | "promotion" | "system";
  isRead: boolean;
  metadata?: {
    orderId?: string;
    bookingId?: string;
    productId?: string;
    salonId?: string;
  };
  createdAt: string;
}

/**
 * ✅ Component Prop Types
 */
export interface CardImageProps {
  route: string;
  src: string;
  onClick?: () => void;
}

export interface AddToCartBtnProps {
  product: ProductType;
  disabled?: boolean;
}
