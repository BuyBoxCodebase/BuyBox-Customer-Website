import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, ShoppingCart } from "lucide-react";

export default function AddToCartButton({
  onAddToCart,
  isAddingToCart,
  inventoryQuantity,
  optionsSelected,
}: {
  onAddToCart: () => void;
  isAddingToCart: boolean;
  inventoryQuantity: number;
  optionsSelected: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.9 }}
      whileHover={
        !isAddingToCart && inventoryQuantity > 0 && optionsSelected
          ? { scale: 1.02 }
          : {}
      }
      whileTap={
        !isAddingToCart && inventoryQuantity > 0 && optionsSelected
          ? { scale: 0.98 }
          : {}
      }>
      <Button
        variant="yellow"
        className="w-full"
        onClick={onAddToCart}
        disabled={
          isAddingToCart || inventoryQuantity === 0 || !optionsSelected
        }>
        {isAddingToCart ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding to Cart...
          </>
        ) : inventoryQuantity === 0 ? (
          "Out of Stock"
        ) : !optionsSelected ? (
          "Please Select Options"
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    </motion.div>
  );
}
