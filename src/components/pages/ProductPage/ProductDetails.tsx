"use client";

import { motion } from "framer-motion";
import {
  OptionGroupDisplay,
  Product,
  SelectedOptions,
  Variant,
} from "@/types/product";
// import OptionsSelector from "./OptionsSelector";
import QuantitySelector from "./QuantitySelector";
import InventoryMessage from "./InventoryMessage";
import AddToCartButton from "./AddToCartButton";
import ProductVariantCards from "./ProductVariantCards";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

// Updated currency formatter to support the new format
const formatPriceWithSuperscriptCents = (price: number) => {
  const [dollars, cents] = price.toLocaleString().split('.');
  
  return (
    <div className="inline-flex flex-wrap">
      <span className="text-xl sm:text-2xl md:text-3xl font-semibold">
        ${dollars}
      </span>
      <span className="text-xs font-semibold relative bottom-auto top-0 mt-1 ml-0.5">
        {cents ? cents : "00"}
      </span>
    </div>
  );
};

export default function ProductDetails({
  product,
  displayPrice,
  availableOptions,
  quantity,
  onDecrease,
  onIncrease,
  inventoryQuantity,
  onAddToCart,
  isAddingToCart,
  onSelectOption,
  selectedOptions,
}: {
  product: Product;
  displayPrice: number;
  availableOptions: OptionGroupDisplay[];
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  inventoryQuantity: number;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  onSelectOption: (groupName: string, optionId: string) => void;
  selectedOptions: { [groupName: string]: string };
}) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.selectedVariant || null
  );

  const optionsSelected =
    availableOptions.length === 0 ||
    availableOptions.every((group) => selectedOptions[group.name]);

  const handleSelectVariant = (variant: Variant) => {
    setSelectedVariant(variant);

    if (variant.options && variant.options.length > 0) {
      const newOptions: SelectedOptions = {};

      variant.options.forEach((opt) => {
        if (product.options) {
          product.options.forEach((group) => {
            if (group.values && group.values.length > 0) {
              group.values.forEach((val) => {
                if (val.value === opt.optionValue.value && val.option) {
                  newOptions[val.option.name] = val.id;
                }
              });
            }
          });
        }
      });

      Object.entries(newOptions).forEach(([groupName, optionId]) => {
        if (selectedOptions[groupName] !== optionId) {
          onSelectOption(groupName, optionId);
        }
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Shop now ${product.name}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err);
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  useEffect(() => {
    if (product.selectedVariant) {
      setSelectedVariant(product.selectedVariant);
    }
  }, [product.selectedVariant]);

  useEffect(() => {
    if (product?.variants && Object.keys(selectedOptions).length > 0) {
      const selectedValues = new Set();

      Object.entries(selectedOptions).forEach(([groupName, optionId]) => {
        if (product.options) {
          product.options.forEach((group) => {
            if (group.values) {
              group.values.forEach((val) => {
                if (val.id === optionId) {
                  selectedValues.add(val.value);
                }
              });
            }
          });
        }
      });

      const matchingVariant = product.variants.find((variant) => {
        if (!variant.options || variant.options.length === 0) return false;
        if (variant.options.length !== selectedValues.size) return false;

        return variant.options.every((opt) =>
          selectedValues.has(opt.optionValue.value)
        );
      });

      if (matchingVariant && matchingVariant.id !== selectedVariant?.id) {
        setSelectedVariant(matchingVariant);
      }
    }
  }, [product, selectedOptions, selectedVariant?.id]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold">
          {product.name}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-full hover:bg-black-100">
            <Share2 className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="text-gray-600 text-sm md:text-base lg:text-lg">
        {selectedVariant?.description || product.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex flex-wrap gap-2">
        {product.category?.name && (
          <Badge
            onClick={() => {
              router.push(`/subcategory/${product.category.id}`);
            }}
            variant="outline"
            className="bg-orange-400 text-white cursor-pointer px-2 py-1 hover:bg-orange-500 hover:text-white">
            {product.category.name}
          </Badge>
        )}
        {product.subCategory?.name && (
          <Badge
            onClick={() => {
              router.push(
                `/subcategory/${product.category.id}%2F${product.subCategory?.name}`
              );
            }}
            variant="outline"
            className="bg-orange-400 text-white cursor-pointer px-2 py-1 hover:bg-orange-500 hover:text-white">
            {product.subCategory.name}
          </Badge>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="font-semibold">
        {formatPriceWithSuperscriptCents(selectedVariant?.price || displayPrice)}
      </motion.div>

      <div className="md:max-w-3xl lg:max-w-4xl">
        <ProductVariantCards
          product={product}
          selectedVariantId={selectedVariant?.id || null}
          onSelectVariant={handleSelectVariant}
        />
      </div>

      <div className="md:flex-col md:items-center md:gap-8 lg:gap-12">
        <div className="md:w-1/2 mb-4 md:mb-0 md:pb-4 lg:pb-4">
          <QuantitySelector
            quantity={quantity}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            disabled={isAddingToCart || inventoryQuantity === 0}
          />
        </div>

        <div className="md:w-1/2">
          <InventoryMessage inventoryQuantity={inventoryQuantity} />
        </div>
      </div>

      <div className="">
        <AddToCartButton
          onAddToCart={onAddToCart}
          isAddingToCart={isAddingToCart}
          inventoryQuantity={inventoryQuantity}
          optionsSelected={optionsSelected}
        />
      </div>
    </motion.div>
  );
}