import type { OrderStatus, PaymentMode } from "./get_order_details";

// Types for the request payload
export interface CreateOrderRequest {
  email: string;
  phoneNumber: string;
  address: string;
  cartId: string;
  paymentMode: PaymentMode;
  deliveryTime?: string;
}

// Types for the order product in response
interface OrderProduct {
  id: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  orderId?: string;
  products: {
    productId: string;
    quantity: number;
  };
}

// Types for the response data
export interface CreateOrderResponse {
  id: string;
  userId: string;
  email: string;
  phoneNumber: number;
  address: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMode: PaymentMode;
  createdAt: string;
  updatedAt: string;
  products: OrderProduct[];
  deliveryTime?: string;
}
