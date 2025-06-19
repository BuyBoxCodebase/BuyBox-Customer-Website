import { CartProduct } from "@/types/cart/get-my-cart/cart-response";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartState {
  cart: CartProduct[];
  cartId: string | null;
  addToCart: (items: CartProduct[]) => void;
  setCartId: (id: string | null) => void;
  removeFromCart: (productId: string, variantId: string | null) => void;
  deleteCart: () => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId: string | null
  ) => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: [],
      cartId: null,
      setCartId: (id) => set({ cartId: id }),
      addToCart: (items) =>
        set((state) => {
          const updatedCart = [...state.cart];

          items.forEach((newItem) => {
            const itemId = newItem.variantId
              ? newItem.variantId
              : newItem.productId;

            const existingItemIndex = updatedCart.findIndex((item) => {
              const currentItemId = item.variantId
                ? item.variantId
                : item.productId;
              return currentItemId === itemId;
            });

            if (existingItemIndex !== -1) {
              const existingItem = updatedCart[existingItemIndex];
              const updatedQuantity = existingItem.quantity + newItem.quantity;
              if (updatedQuantity > 0) {
                updatedCart[existingItemIndex] = {
                  ...existingItem,
                  quantity: updatedQuantity,
                  totalPrice: newItem.totalPrice,
                };
              } else {
                updatedCart.splice(existingItemIndex, 1);
              }
            } else {
              if (newItem.quantity > 0) {
                updatedCart.push({
                  ...newItem,
                  totalPrice: newItem.totalPrice,
                });
              }
            }
          });

          return { cart: updatedCart };
        }),
      removeFromCart: (productId, variantId) =>
        set((state) => ({
          cart: state.cart.filter((item) => {
            return item.productId !== productId && item.variantId !== variantId;
          }),
        })),
      deleteCart: () => set({ cart: [] }),
      updateQuantity: (productId, quantity, variantId) =>
        set((state) => {
          const updatedCart = state.cart
            .map((item) => {
              const currentItemId = item.variantId
                ? item.variantId
                : item.productId;
              if (currentItemId === productId) {
                return {
                  ...item,
                  quantity,
                  totalPrice: item.totalPrice,
                };
              }
              return item;
            })
            .filter((item) => item.quantity > 0);
          return { cart: updatedCart };
        }),
    }),
    {
      name: "cart-storage",
    }
  )
);

export default useCartStore;
