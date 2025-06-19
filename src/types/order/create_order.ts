// Types for the request payload
export interface CreateOrderRequest {
  email: string;
  phoneNumber: string;
  address: string;
  cartId: string;
  paymentMode: "CASH_ON_DELIVERY" | "ONLINE";
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
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  paymentMode: "CASH_ON_DELIVERY" | "ONLINE";
  createdAt: string;
  updatedAt: string;
  products: OrderProduct[];
  deliveryTime?: string;
}
