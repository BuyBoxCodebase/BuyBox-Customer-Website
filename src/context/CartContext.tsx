"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import useCartStore from "@/zustand/cartStore";
import { trackEvent } from "@/lib/analytics/core";
import { UserEventType } from "@/lib/analytics/constants";
import { useAuth } from "@/context/AuthContext";
import useAddCart from "@/hooks/cart/useAddCart";
import useClearCart from "@/hooks/cart/useClearCart";
import useGetMyCart from "@/hooks/cart/useGetMyCart";
import { CartProduct } from "@/types/cart/get-my-cart/cart-response";
import useRemoveItemCart from "@/hooks/cart/useRemoveItemCart";

// Define the context type
interface CartContextType {
  cart: CartProduct[];
  cartId: string | null;
  loading: boolean;
  error: string | null;
  addProductToCart: (
    products: Array<{
      productId: string;
      quantity: number;
      variantId: string | null;
      cartProductDetails?: Partial<CartProduct>;
    }>
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId: string | null
  ) => void;
  removeFromCart: (productId: string, variantId: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    cart,
    addToCart,
    deleteCart,
    updateQuantity: updateCartQuantity,
    removeFromCart: removeCartItem,
  } = useCartStore();

  const {
    addProductToCart: apiAddToCart,
    loading: addLoading,
    error: addError,
  } = useAddCart();

  const {
    clearCart: apiClearCart,
    loading: clearLoading,
    error: clearError,
  } = useClearCart();

  const { isAuthenticated } = useAuth();

  const {
    loading: getLoading,
    error: getError,
    fetchCart: apiFetchCart,
  } = useGetMyCart();

  const {
    removeProductToCart: handleUpdateProducts,
    loading: removeLoading,
    error: removeError,
  } = useRemoveItemCart();

  const loading = addLoading || clearLoading || getLoading;
  const error = localError || addError || clearError || getError;

  const handleFetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      setLocalError(null);

      // Merge guest cart if needed before fetching
      const { cart: localCart, cartId } = useCartStore.getState();
      if (localCart.length > 0 && !cartId) {
        try {
          const productsToMerge = localCart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || null,
          }));
          await apiAddToCart(productsToMerge);
        } catch (e) {
          console.error("[CartContext] Failed to merge guest cart", e);
        }
      }

      const response = await apiFetchCart();
      // Always clear the local cart first when syncing from server
      deleteCart();

      if (response?.cartDetails) {
        useCartStore.getState().setCartId(response.cartDetails.id);

        if (
          response.cartDetails.products &&
          response.cartDetails.products.length > 0
        ) {
          addToCart(response.cartDetails.products as any);
        }
      } else {
        // If cartDetails is null or doesn't exist, ensure cart remains empty
        useCartStore.getState().setCartId(null);
      }
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Failed to fetch cart"
      );
      console.error("Error fetching cart:", err);

      // On error, clear the local cart to avoid desynchronization
      deleteCart();
      useCartStore.getState().setCartId(null);
    }
  };
  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      handleFetchCart();
    }
  }, [isAuthenticated]);

  const handleAddProducts = async (
    products: Array<{
      productId: string;
      quantity: number;
      variantId: string | null;
      cartProductDetails?: Partial<CartProduct>;
    }>
  ) => {
    try {
      setLocalError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        // Guest mode
        const cartProductsToAdd: CartProduct[] = products.map(p => {
          const price = p.cartProductDetails?.price || 0;
          return {
            id: p.cartProductDetails?.id || p.productId,
            productId: p.productId,
            variantId: p.variantId,
            quantity: p.quantity,
            price: price,
            totalPrice: price * p.quantity,
            name: p.cartProductDetails?.name || "Product",
            description: p.cartProductDetails?.description || "",
            images: p.cartProductDetails?.images || [],
            category: p.cartProductDetails?.category || { name: "" },
            subCategory: p.cartProductDetails?.subCategory || null,
            options: p.cartProductDetails?.options || [],
          };
        });
        
        useCartStore.getState().addToCart(cartProductsToAdd);
        return;
      }

      const response = await apiAddToCart(
        products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          variantId: p.variantId || null,
        }))
      );
      if (response && response.success) {
        await handleFetchCart();
      } else {
        throw new Error(response?.message || "Failed to add products to cart");
      }
    } catch (err) {
      setLocalError("Failed to add products");
      console.error("Error adding products to cart:", err);
    }
  };

  const handleClearCart = async () => {
    try {
      setLocalError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        deleteCart();
        return;
      }
      const response = await apiClearCart();
      if (response === true) {
        deleteCart();
      } else {
        throw new Error("Failed to clear cart");
      }
    } catch (err) {
      setLocalError("Failed to clear cart");
      console.error("Error clearing cart:", err);
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    quantity: number,
    variantId: string | null
  ) => {
    // Find the item in the cart
    const item = cart.find((cartItem) => {
      return (
        cartItem.productId === productId && cartItem.variantId === variantId
      );
    });

    if (!item) return;

    // Temporarily update local state for UI responsiveness
    updateCartQuantity(productId, item.quantity + quantity, variantId);

    // Prepare the API call with the product/variant details
    const productToUpdate = {
      productId: item.productId, // Assuming product name is used as ID
      quantity: quantity, // Just pass +1 or -1 as specified
      variantId: item.variantId,
    };

    // Call the API to update the quantity
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Guest mode: local state already updated temporarily, no API call needed
        return;
      }
      await handleUpdateProducts(productToUpdate);
      await handleFetchCart();
    } catch (err) {
      // If API fails, revert the local state change
      await handleFetchCart();
    }
  };

  const handleRemoveFromCart = async (
    productId: string,
    variantId: string | null
  ) => {
    // Find the item in the cart
    const item = cart.find((cartItem) => {
      return (
        cartItem.productId === productId && cartItem.variantId === variantId
      );
    });

    // console.log("Highlighted code");
    // console.log(productId, variantId);
    if (!item) return;

    trackEvent({
      type: UserEventType.REMOVE_FROM_CART,
      productId: item.productId,
      metadata: { variantId: item.variantId, quantity: item.quantity }
    });

    removeCartItem(item.productId, item.variantId);

    const productToRemove = {
      productId: item.productId,
      variantId: item.variantId,
    };

    // Call the API to remove the item
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // Guest mode: local state already updated, no API call needed
        return;
      }
      await handleUpdateProducts(productToRemove);
      await handleFetchCart();
    } catch (err) {
      // If API fails, revert the local state change
      await handleFetchCart();
    }
  };

  const contextValue: CartContextType = {
    cart,
    cartId: useCartStore.getState().cartId,
    loading,
    error,
    addProductToCart: handleAddProducts,
    clearCart: handleClearCart,
    fetchCart: handleFetchCart,
    updateQuantity: handleUpdateQuantity,
    removeFromCart: handleRemoveFromCart,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
