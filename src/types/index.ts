export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  stock: number;
  category_id: string;
  seller_id: string;
  images: string[];
  rating_average?: number;
  review_count?: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parent_id?: string;
}

export interface Seller {
  id: string;
  user_id: string;
  store_name: string;
  store_logo?: string;
  description?: string;
  rating_average: number;
  followers: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  selected: boolean;
  product?: Product;
}

export interface UserAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';
