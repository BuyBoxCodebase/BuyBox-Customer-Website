"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCartContext } from "../../context/CartContext";
import { useToast } from "@/hooks/toast/use-toast";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function SubCatCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addProductToCart } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);
  const token = localStorage.getItem("token");

  // Safely check inventory
  const quantity = product.inventory?.quantity ?? 0;
  const isOutOfStock = quantity === 0;

  const handleAddToCart = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
        variant: "default",
        className: "top-[4rem]",
        action: (
          <Button variant="orange" onClick={() => router.push("/user/login")}>
            Log In
          </Button>
        ),
      });
      return;
    }

    setIsAdding(true);
    try {
      await addProductToCart([
        {
          productId: product.id,
          quantity: 1,
          variantId: product.defaultVariant ? product.defaultVariant.id : null,
        },
      ]);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
        className: "top-[4rem]",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
        className: "top-[4rem]",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Determine inventory message
  const getInventoryMessage = () => {
    if (!product.inventory) return null;
    if (quantity > 5 && quantity < 15) {
      return (
        <p className="text-sm text-yellow-600">
          Few items remaining, order fast!
        </p>
      );
    }
    if (quantity > 0 && quantity <= 5) {
      return <p className="text-sm text-red-600">{quantity} items left!</p>;
    }
    return null;
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden relative group hover:shadow-lg transition-shadow">
        <div className="aspect-square relative">
          <Image
            src={product.images[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-2 truncate">
            {product.name}
          </h3>
          <h4 className="font-semibold text-sm mb-2 truncate">
            {product.description}
          </h4>
          <p className="text-sm text-muted-foreground">
            {formatPrice(product.basePrice)}
          </p>

          {/* {getInventoryMessage()} */}

          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`mt-2 inline-flex items-center rounded px-3 py-1 text-sm text-black 
              focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed 
              transition-colors duration-200
              ${
                isOutOfStock ? "bg-gray-400" : "bg-[#FF6B00] hover:bg-[#e65f00]"
              }`}>
            <ShoppingCart className="mr-1 h-4 w-4" />
            {isOutOfStock
              ? "Out of Stock"
              : isAdding
              ? "Adding..."
              : "Add to Cart"}
          </button>
        </CardContent>
      </Card>
    </Link>
  );
}
