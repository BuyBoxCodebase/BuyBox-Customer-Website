import type { CreateOrderRequest } from "./create_order";

// Mirrors EcocashPaymentStatus in the backend's schema.prisma
export type EcocashPaymentStatus =
  | "INITIATED"
  | "PUSH_SENT"
  | "PUSH_FAILED"
  | "FAILED"
  | "EXPIRED"
  | "PAID"
  | "ORDER_CREATED"
  | "ORDER_FAILED";

// The checkout form without paymentMode (the backend sets ECOCASH), plus the number to charge
export type InitiateEcocashPaymentRequest = Omit<CreateOrderRequest, "paymentMode"> & {
  ecocashNumber: string;
};

export interface EcocashPayment {
  id: string;
  status: EcocashPaymentStatus;
  amount: number;
  currency: string;
  orderId: string | null;
  expiresAt: string;
  // Customer-facing text for the current status, written by the backend
  message: string;
}

// Still waiting on the customer or EcoCash; keep polling
export const ECOCASH_PENDING_STATUSES: EcocashPaymentStatus[] = ["INITIATED", "PUSH_SENT", "PAID"];
