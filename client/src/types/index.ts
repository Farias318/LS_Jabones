export interface Product {
  id: string;
  name: string;
  perfume: string;
  description: string;
  attributes: string[];
  price: number;
  imageUrl?: string;
  active: boolean;
}

export interface Combo {
  id: string;
  name: string;
  comboPrice: number;
  description: string;
  productIds: string[];
  active: boolean;
}

export type CartRefType = 'product' | 'combo';

export interface CartItem {
  refType: CartRefType;
  refId: string;
  nameSnapshot: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  notes?: string;
}

export type OrderStatus = 'pendiente' | 'en_fabricacion' | 'listo' | 'entregado' | 'cancelado';

export interface Order {
  id: string;
  code: string;
  customer: CustomerInfo;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}
