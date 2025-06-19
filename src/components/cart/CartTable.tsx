"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartContext } from "../../context/CartContext";
import { CartProduct } from "@/types/cart/get-my-cart/cart-response";

export default function CartTable() {
  const { cart, removeFromCart, updateQuantity, addProductToCart, fetchCart } =
    useCartContext();

  if (!cart || cart.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <p className="text-black text-center">Your cart is empty.</p>
      </div>
    );
  }

  const getItemId = (item: CartProduct): string => {
    return item.variantId ? item.variantId : item.productId;
  };

  const getItemImage = (item: CartProduct): string => {
    if (item.variantId && item.images && item.images.length > 0) {
      return item.images[0];
    }
    return item.images && item.images.length > 0
      ? item.images[0]
      : "/placeholder.svg";
  };

  const getItemName = (item: CartProduct): string => {
    if (item.variantId && item.name) {
      return item.name;
    }
    return item.name;
  };

  const getItemDescription = (item: CartProduct): string => {
    if (item.variantId && item.description) {
      return item.description;
    }
    return item.description;
  };

  const formatPrice = (price: number | undefined): string => {
    if (price === undefined || price === null) return "$0.00";
    return `$${price.toFixed(2)}`;
  };

  // useEffect(() => {
  //   fetchCart();
  // }, [removeFromCart, updateQuantity, addProductToCart]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded shadow space-y-4">
      <div className="hidden md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-sm uppercase text-gray-500">
                Product Details
              </th>
              <th className="py-3 text-sm uppercase text-gray-500">Options</th>
              <th className="py-3 text-sm uppercase text-gray-500">Quantity</th>
              <th className="py-3 text-sm uppercase text-gray-500">
                Total Price
              </th>
              <th className="py-3 text-sm text-right uppercase text-gray-500">
                Remove
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cart.map((item) => (
              <tr
                key={getItemId(item)}
                className="hover:bg-gray-50 transition-colors">
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 border rounded-md overflow-hidden">
                      <Image
                        src={getItemImage(item)}
                        alt={getItemName(item)}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-base">
                        {getItemName(item)}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {getItemDescription(item)}
                      </p>
                      {item.variantId && (
                        <p className="text-xs text-gray-400">{item.name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex flex-wrap gap-2">
                    {item.variantId &&
                      item.options &&
                      item.options.map((option, index) => (
                        <div key={index} className="flex flex-wrap">
                          <Badge
                            variant="outline"
                            className="bg-yellow-400 text-black cursor-pointer px-2 py-1 hover:bg-white hover:text-black">
                            {option.value}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-md">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.productId, 1, item.variantId)
                          : removeFromCart(item.productId, item.variantId)
                      }>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        addProductToCart([
                          {
                            productId: item.productId,
                            quantity: 1,
                            variantId: item.variantId,
                          },
                        ])
                      }>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
                <td className="py-5">
                  <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                </td>
                <td className="py-5 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeFromCart(item.productId, item.variantId)
                    }
                    className="text-red-500 hover:text-red-700 hover:bg-red-100">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-6">
        {cart.map((item) => (
          <div
            key={getItemId(item)}
            className="border rounded-lg p-5 space-y-5 hover:bg-gray-50 transition-colors">
            <div className="flex gap-4">
              <div className="relative w-24 h-24 flex-shrink-0 border rounded-md overflow-hidden">
                <Image
                  src={getItemImage(item)}
                  alt={getItemName(item)}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-grow space-y-2">
                <div>
                  <p className="font-semibold">{getItemName(item)}</p>
                  {item.variantId && (
                    <p className="text-xs text-gray-400 mt-1">{item.name}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {item.variantId &&
                    item.options &&
                    item.options.map((option, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-gray-100">
                        {option.value}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-md">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    item.quantity > 1
                      ? updateQuantity(item.productId, 1, item.variantId)
                      : removeFromCart(item.productId, item.variantId)
                  }>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    addProductToCart([
                      {
                        productId: item.productId,
                        quantity: 1,
                        variantId: item.variantId,
                      },
                    ])
                  }>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="font-medium">{formatPrice(item.totalPrice)}</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFromCart(item.productId, item.variantId)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
