export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  inventory: number;
  imageUrl?: string;
}

export interface MemberProfile {
  id: string;
  email: string;
  displayName: string;
  status: 'pending' | 'approved' | 'blocked' | 'kit';
  shippingAddress: string;
  phone: string;
  createdAt: any;
  updatedAt: any;
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
}

export interface OrderDetail {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  shippingInfo: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    notes?: string;
    carrier?: string;
    method?: string;
    cost?: number;
    deliveryEstimate?: string;
    weightLbs?: number;
  };
  status: 'placed' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentStatus?: 'unpaid' | 'paid';
  trackingNumber?: string;
  trackingStatus?: 'shipped' | 'delivered';
  tax?: number;
  createdAt: any;
}

export interface ShippingOption {
  id: string;
  carrier: 'USPS' | 'UPS';
  name: string;
  cost: number;
  transitDaysMin: number;
  transitDaysMax: number;
  estimatedDeliveryDate: string;
}

export type LabratThemeMode = 'neon' | 'clinical';
