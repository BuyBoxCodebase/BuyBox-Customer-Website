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
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  paymentMode: "CASH_ON_DELIVERY" | "ONLINE";
  totalAmount: number;
  createdAt: string;
}
