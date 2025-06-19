import { motion } from "framer-motion";
import { Product, Variant } from "@/types/product";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductVariantCardsProps {
  product: Product;
  selectedVariantId: string | null;
  onSelectVariant: (variant: Variant) => void;
}

export default function ProductVariantCards({
  product,
  selectedVariantId,
  onSelectVariant,
}: ProductVariantCardsProps) {
  const router = useRouter();

  if (!product.variants || product.variants.length === 0) {
    return null;
  }

  const handleVariantClick = (variant: Variant) => {
    if (variant.inventory && variant.inventory?.[0].quantity > 0) {
      router.push(`/product/${variant.id}`);
      onSelectVariant(variant);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Available Sizes:
      </h3>

      {/* Horizontal Scroll View for Small and Medium Screens */}
      <div className="relative lg:hidden">
        <div className="flex overflow-x-auto pb-4 pt-1 px-1 hide-scrollbar snap-x snap-mandatory">
          {product.variants.map((variant, index) => {
            const optionValues = variant.options
              .map((opt) => opt.optionValue.value)
              .join(" + ");
            const isAvailable =
              variant.inventory && variant.inventory?.[0].quantity > 0;
            const isSelected = variant.id === selectedVariantId;
            const variantImage =
              variant.images && variant.images.length > 0
                ? variant.images[0]
                : "/placeholder-image.jpg";

            return (
              <motion.div
                key={variant.id || index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: 0.2 + index * 0.05,
                }}
                className={cn(
                  "relative cursor-pointer rounded-lg border p-2 transition-all flex-shrink-0 snap-start",
                  "mr-3 w-32 sm:w-40",
                  isSelected
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200",
                  !isAvailable && "opacity-60 cursor-not-allowed"
                )}
                onClick={() => isAvailable && handleVariantClick(variant)}>
                <div className="aspect-square relative mb-2 rounded overflow-hidden">
                  <Image
                    src={variantImage}
                    alt={optionValues}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Size and availability in the same row */}
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs font-medium truncate">
                    {optionValues}
                  </div>
                  <div>
                    {isAvailable ? (
                      <span className="text-xs flex items-center text-green-600">
                        <Check size={12} className="mr-1" />
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs flex items-center text-red-600">
                        <X size={12} className="mr-1" />
                        Out
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <style jsx global>{`
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Grid View for Large Screens */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-3">
        {product.variants.map((variant, index) => {
          const optionValues = variant.options
            .map((opt) => opt.optionValue.value)
            .join(" + ");
          const isAvailable =
            variant.inventory && variant.inventory?.[0].quantity > 0;
          const isSelected = variant.id === selectedVariantId;
          const variantImage =
            variant.images && variant.images.length > 0
              ? variant.images[0]
              : "/placeholder-image.jpg";

          return (
            <motion.div
              key={variant.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.2 + index * 0.05,
              }}
              className={cn(
                "relative cursor-pointer rounded-lg border p-2 transition-all",
                isSelected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200",
                !isAvailable && "opacity-60 cursor-not-allowed"
              )}
              onClick={() => isAvailable && handleVariantClick(variant)}>
              <div className="aspect-square relative mb-2 rounded overflow-hidden">
                <Image
                  src={variantImage}
                  alt={optionValues}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Size and availability in the same row */}
              <div className="flex justify-between items-center">
                <div className="text-xs font-medium">{optionValues}</div>
                <div>
                  {isAvailable ? (
                    <span className="text-xs flex items-center text-green-600">
                      <Check size={12} className="mr-1" />
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs flex items-center text-red-600">
                      <X size={12} className="mr-1" />
                      Out
                    </span>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1">
                  <Check size={12} className="text-black" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
