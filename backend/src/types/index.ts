export type Role = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameTh: string;
  slug: string;
  description: string;
  descriptionTh: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  country: string;
  logo: string;
  isActive: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  pricePerPiece: number;
  pricePerBox: number;
  stockPieces: number;
  piecesPerBox: number;
  coveragePerBox: number;
  weightPerBox: number;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  nameTh?: string;
  slug: string;
  description: string;
  descriptionTh?: string;
  shortDescription: string;
  shortDescriptionTh?: string;
  brandId?: string;
  brandName?: string;
  categoryId: string;
  categoryName?: string;
  collectionId?: string;
  collectionName?: string;
  thumbnail: string;
  images: string[];
  size: string;
  width?: number;
  height?: number;
  thickness?: number;
  material: string;
  surface: string;
  color: string;
  pattern: string;
  indoorOutdoor: string;
  countryOfOrigin: string;
  piecesPerBox: number;
  coveragePerBox: number;
  weightPerBox: number;
  pricePerPiece: number;
  pricePerBox: number;
  stockPieces: number;
  minimumOrderQuantity: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  quantity: number; // in pieces
  unitPrice: number;
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  updatedAt: string;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  addressLine: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

export interface TaxInvoiceDetails {
  companyName: string;
  taxId: string;
  branch: string;
  address: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  variantInfo?: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  thumbnail?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  userEmail?: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  taxAmount: number;
  paymentMethod: 'Bank Transfer' | 'PromptPay QR' | 'Credit Card';
  shippingAddress: ShippingAddress;
  recipientName: string;
  recipientPhone: string;
  taxInvoiceRequested: boolean;
  taxInvoiceDetails?: TaxInvoiceDetails;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  minQuantity: number;
  productIds?: string[];
  categoryIds?: string[];
}

export interface RoomArea {
  id: string;
  roomId: string;
  name: string;
  areaType: 'Floor' | 'Wall' | 'Backsplash';
  maskSvgPolygon: string;
  defaultTileAspectRatio: string;
}

export interface Room {
  id: string;
  name: string;
  nameTh?: string;
  slug: string;
  imageUrl: string;
  description: string;
  areas: RoomArea[];
}
