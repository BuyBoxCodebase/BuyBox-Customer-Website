import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

export default function InventoryMessage({ inventoryQuantity }: { inventoryQuantity: number }) {
    if (inventoryQuantity > 0 && inventoryQuantity < 15) {
      return (
        <AnimatePresence>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-orange-600 text-sm"
          >
            {inventoryQuantity <= 5
              ? `Only ${inventoryQuantity} items left!`
              : "Few items remaining, order fast!"}
          </motion.p>
        </AnimatePresence>
      );
    }
    return null;
  }