export interface Variant {
  id: string;
  size: string;
  price: number;
  mrp: number;
  stock: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  categoryId: string;
  subcategory: string;
  packSize: string;
  variants: Variant[];
  price: number;
  mrp: number;
  discount: number;
  stock: number;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  sku: string;
  description: string;
  details: string;
  image: string;
  tags: string[];
  related?: Product[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
  description: string;
  itemCount: number;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  brand: string;
  packSize: string;
  price: number;
  mrp: number;
  quantity: number;
  image: string;
  maxStock: number;
}

export interface Address {
  id?: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  houseNo?: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  pinCode: string;
  landmark?: string;
  fullAddressText?: string;
  isDefault?: boolean;
}

export interface StatusHistoryItem {
  status: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  idempotencyKey?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: Address;
  items: {
    productId: string;
    name: string;
    packSize: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'Order Placed' | 'Order Confirmed' | 'Preparing Your Order' | 'Ready for Dispatch' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliverySlot: string;
  instructions?: string;
  createdAt: string;
  statusHistory: StatusHistoryItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  avatar?: string;
  provider?: 'email' | 'google';
  savedAddresses?: Address[];
}

export const ADMIN_EMAILS = [
  'siddhukumar2006@gmail.com',
  'vyapaarwebs@gmail.com',
  'kdsuperm@gmail.com'
];

export const isStoreAdmin = (user: User | null | undefined): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (!user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
};

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeType: string;
  address: string;
  whatsappNumber: string;
  whatsappRaw: string;
  googleRating: number;
  googleReviewsCount: number;
  googleMapsUrl: string;
  storeTimings: string;
  minOrderValue: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  deliveryAreas: string[];
  announcementText: string;
  razorpayKeyId: string;
  isRazorpayTestMode: boolean;
  codEnabled: boolean;
  whatsappOrderingEnabled: boolean;
  acceptingOrders?: boolean;
  pausedMessage?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface PromoCode {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
  expiryDate?: string;
  usageCount?: number;
}
