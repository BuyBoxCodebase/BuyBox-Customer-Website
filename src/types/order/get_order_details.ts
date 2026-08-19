// Mirrors the OrderStatus / PaymentMode enums in the backend's schema.prisma.
export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELED"
  | "OUT_OF_STOCK";

export type PaymentMode =
  | "CASH_ON_DELIVERY"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "UPI"
  | "NETBANKING";

// What the customer sees for each status. PROCESSING means the seller has
// accepted the order.
export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Order Accepted",
  COMPLETED: "Completed",
  CANCELED: "Cancelled",
  OUT_OF_STOCK: "Out of Stock",
};

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
  status: OrderStatus;
  totalAmount: number;
  paymentMode: PaymentMode;
  deliveryAgentId: string | null;
  createdAt: string;
  _count: Count;
  products: OrderProduct[];
  deliveryAgent: DeliveryAgent | null;
  deliveryTime?: string;
}