import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartContext } from "../../../context/CartContext";

export const CartIcon = () => {
  const { cart } = useCartContext();
  const totalItems = cart.reduce(
    (acc: number, item: { quantity: number }) => acc + item.quantity,
    0
  );

  return (
    <Link href="/cart">
      <motion.div
        className="relative p-2 hover:bg-gray-100 rounded-full hover:text-gray-800"
        whileHover={{ y: -3, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}>
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 text-black rounded-full text-xs px-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            key={totalItems}>
            {totalItems}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};
