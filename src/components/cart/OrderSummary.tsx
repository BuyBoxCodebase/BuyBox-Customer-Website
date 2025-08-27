"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartContext } from "../../context/CartContext";
import { Loader2, Trash2 } from "lucide-react";
import useCartStore from "@/zustand/cartStore";

export default function OrderSummary() {
  const { cart, clearCart } = useCartContext();
  const { deleteCart } = useCartStore();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      deleteCart();
    } finally {
      setIsClearing(false);
    }
  };

  // Calculate subtotal using totalPrice from each cart item
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const shippingCost = cart.length > 0 ? 5.0 : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Shipping</span>
          <span>${shippingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-medium border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          href="/checkout"
          className={cart.length === 0 ? "pointer-events-none" : ""}>
          <Button
            variant="default"
            className="w-full"
            disabled={cart.length === 0}
            aria-label={
              cart.length === 0 ? "Cart is empty" : "Proceed to checkout"
            }>
            {cart.length === 0 ? "Cart is Empty" : "Proceed to Checkout"}
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full relative overflow-hidden transition-all duration-200 ease-in-out"
          onClick={handleClearCart}
          disabled={isClearing || cart.length === 0}
          aria-label={cart.length === 0 ? "No items to clear" : "Clear cart"}>
          <span
            className={`flex items-center justify-center transition-opacity duration-200 ${
              isClearing ? "opacity-0" : "opacity-100"
            }`}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </span>
          <span
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
              isClearing ? "opacity-100" : "opacity-0"
            }`}>
            <Loader2 className="w-4 h-4 animate-spin" />
          </span>
        </Button>
        <Button variant="link" asChild className="w-full justify-center">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
