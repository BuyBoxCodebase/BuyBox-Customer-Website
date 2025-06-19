import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

export default function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  disabled,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.8 }}
      className='space-y-3'
    >
      <div>
        <label
          htmlFor='quantity'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Quantity
        </label>
        <div className='flex items-center gap-2'>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant='outline'
              size='icon'
              onClick={onDecrease}
              disabled={disabled}
            >
              <Minus className='h-4 w-4' />
            </Button>
          </motion.div>
          <AnimatePresence mode='wait'>
            <motion.span
              key={quantity}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className='w-12 text-center font-medium'
            >
              {quantity}
            </motion.span>
          </AnimatePresence>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant='outline'
              size='icon'
              onClick={onIncrease}
              disabled={disabled}
            >
              <Plus className='h-4 w-4' />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
