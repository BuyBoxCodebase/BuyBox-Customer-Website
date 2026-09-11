import type { OrderStatus, PaymentMode } from "./get_order_details";

// Types for the user in response
interface User {
  name: string;
  email: string;
}

// Types for the count in response
interface Count {
  products: number;
}

// Types for the order in response
export interface Order {
  _count: Count;
  id: string;
  address: string;
  email: string;
  phoneNumber: number;
  user: User;
  status: OrderStatus;
  paymentMode: PaymentMode;
  totalAmount: number;
  createdAt: string;
}
