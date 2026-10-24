import type { OrderStatus, PaymentMode } from "./get_order_details";

// Types for the request payload
export interface CreateOrderRequest {
  email: string;
  phoneNumber: string;
  address: string;
  cartId: string;
  paymentMode: PaymentMode;
  deliveryTime?: string;
  fulfillmentType?: string;
  // The hub chosen for pickup or home delivery
  pickupLocationId: string;
  pickupDate?: string;
  deliveryCoordinates?: { latitude: number; longitude: number };
  // Saved by the backend so the next checkout can prefill it
  deliveryAddress?: { address: string; city: string; state?: string };
}

// Details saved from the customer's last checkout
export interface OrderPreference {
  email: string;
  phoneNumber: string;
  paymentMode: PaymentMode;
  address: string | null;
  city: string | null;
  state: string | null;
  deliveryCoordinates: { latitude: number; longitude: number } | null;
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
