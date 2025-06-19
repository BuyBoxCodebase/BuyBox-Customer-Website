interface Category {
  name: string;
}

interface SubCategory {
  name: string;
}

interface Product {
  name: string;
  description: string;
  images: string[];
  basePrice: number;
  category: Category;
  subCategory: SubCategory | null;
}

interface FormattedOption {
  name: string;
  value: string;
}

interface Variant {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  formattedOptions: FormattedOption[];
}

interface OrderProduct {
  quantity: number;
  totalPrice: number;
  product: Product;
  variant: Variant | null;
}

interface Count {
  products: number;
}

interface DeliveryAgent {
  id?: string;
  name?: string;
  contactInfo?: string;
}

export interface OrderDetails {
  id: string;
  userId: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELED";
  totalAmount: number;
  paymentMode: "CASH_ON_DELIVERY" | "ONLINE";
  deliveryAgentId: string | null;
  createdAt: string;
  _count: Count;
  products: OrderProduct[];
  deliveryAgent: DeliveryAgent | null;
  deliveryTime?: string;
}