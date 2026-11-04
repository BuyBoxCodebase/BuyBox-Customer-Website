"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Smartphone, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EcocashPayment } from "@/types/order/ecocash_payment";

type Props = {
  payment: EcocashPayment | null;
  isPending: boolean;
  timedOut: boolean;
  onRetry: () => void;
  onClose: () => void;
};

const useCountdown = (until: string | undefined, active: boolean) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  if (!until) return null;
  const secondsLeft = Math.max(0, Math.floor((new Date(until).getTime() - now) / 1000));
  return `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;
};

export default function EcocashPaymentDialog({ payment, isPending, timedOut, onRetry, onClose }: Props) {
  const countdown = useCountdown(payment?.expiresAt, isPending);
  const status = payment?.status;
  const failed = status === "FAILED" || status === "PUSH_FAILED" || status === "EXPIRED";

  return (
    <Dialog
      open={!!payment}
      // Closing mid-payment would hide the result while the customer may still approve it
      onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => isPending && e.preventDefault()}>
        {payment && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {status === "ORDER_CREATED" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : failed || status === "ORDER_FAILED" ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <Smartphone className="h-5 w-5" />
                )}
                {status === "ORDER_CREATED"
                  ? "Payment successful"
                  : failed
                    ? "Payment not completed"
                    : status === "ORDER_FAILED"
                      ? "We need to sort out your order"
                      : timedOut
                        ? "Still waiting for EcoCash"
                        : "Approve the payment on your phone"}
              </DialogTitle>
              <DialogDescription>
                {timedOut
                  ? "We haven't had a final answer from EcoCash yet. If money left your wallet, your order will appear under My Orders, or our team will contact you."
                  : payment.message}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-md border bg-gray-50 p-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">
                  {payment.currency} {payment.amount.toFixed(2)}
                </span>
              </div>
              {isPending && status !== "PAID" && countdown && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Time left to approve</span>
                  <span className="font-medium tabular-nums">{countdown}</span>
                </div>
              )}
              {(status === "ORDER_FAILED" || timedOut) && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Payment reference</span>
                  <span className="font-mono text-xs break-all">{payment.id}</span>
                </div>
              )}
            </div>

            {isPending && (
              <div className="flex items-center gap-2 text-sm text-gray-600" role="status">
                <Loader2 className="h-4 w-4 animate-spin" />
                {status === "PAID" ? "Creating your order..." : "Waiting for confirmation from EcoCash..."}
              </div>
            )}

            {!isPending && status !== "ORDER_CREATED" && (
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
                {failed && (
                  <Button type="button" className="bg-gray-950 text-white hover:bg-black" onClick={onRetry}>
                    Try again
                  </Button>
                )}
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
