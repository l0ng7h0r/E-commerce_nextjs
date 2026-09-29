export type RoleType = "user" | "seller" | "admin";

export interface User {
  id: string;
  email: string;
  roles: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  roles: string[];
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product?: CartProduct;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: CartProduct;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: "pending" | "paid" | "processing" | "shipped" | "completed" | "cancelled" | string;
  phone_number?: string;
  logistic_company?: string;
  logistic_branch?: string;
  district?: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  method: string;
  payment_url?: string;
  amount: number;
  status: "pending" | "completed" | "failed" | string;
  transaction_id?: string;
  created_at: string;
}

export interface PaymentResponse {
  payment_id: string;
  order_id: string;
  amount: number;
  status: string;
  payment_url: string;
}

export interface QRCodeResponse {
  payment_id: string;
  order_id: string;
  amount: number;
  status: string;
  transaction_id: string;
  qr_code: string;
  deep_link?: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  order_id: string;
  amount: number;
  status: string;
  transaction_id?: string;
  qr_code?: string;
}

export interface ApiError {
  error?: string;
  message?: string;
}
