export interface FormattedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

export interface SubCategory {
  name: string;
}

export interface Category {
  name: string;
}

export interface ProductDetails {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  description: string;
  images: string[];
  category: Category;
  subCategory: SubCategory | null;
}

export interface CartProduct extends ProductDetails {
  quantity: number;
  price: number;
  totalPrice: number;
  options: FormattedOption[];
}

export interface CartResponse {
  success: boolean;
  message: string;
  cartDetails: {
    id: string;
    userId: string;
    updatedAt: string;
    products: CartProduct[];
  } | null;
  totalItems: number;
  subtotal: number;
}
