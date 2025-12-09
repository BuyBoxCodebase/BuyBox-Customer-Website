"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Variant } from "@/types/product";

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  variants: Variant[];
  onConfirm: (variantId: string) => void;
  productName: string;
}

export const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
  isOpen,
  onClose,
  variants,
  onConfirm,
  productName,
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Reset selected variant when modal opens
  useEffect(() => {
    if (isOpen && variants.length > 0) {
      // Select default variant or first variant
      const defaultVariant = variants.find(v => v.isDefault);
      setSelectedVariantId(defaultVariant?.id || variants[0].id);
    }
  }, [isOpen, variants]);

  const handleConfirm = () => {
    if (selectedVariantId) {
      onConfirm(selectedVariantId);
      onClose();
    }
  };

  // Group variants by option name
  const getOptionName = (): string => {
    if (variants.length > 0 && variants[0].options.length > 0) {
      return variants[0].options[0].optionValue.option?.name || "Option";
    }
    return "Option";
  };

  const optionName = getOptionName();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select {optionName}</DialogTitle>
          <DialogDescription>
            Choose a {optionName.toLowerCase()} for {productName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {optionName}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {variants.map((variant) => {
                const optionValue = variant.options[0]?.optionValue?.value || variant.name || "N/A";
                const isSelected = selectedVariantId === variant.id;
                const variantPrice = variant.price;
                console.log("Rendering variant:", variant.id, "Selected:", isSelected, "Price:", variantPrice);

                return (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`
                      relative rounded-lg border-2 p-3 text-center transition-all
                      ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                      }
                    `}
                  >
                    <div className="font-semibold">{optionValue}</div>
                    {variantPrice > 0 && (
                      <div className={`text-xs mt-1 ${isSelected ? "text-gray-200" : "text-gray-500"}`}>
                        ${variantPrice}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedVariantId && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">
                Selected: <span className="font-semibold text-gray-900">
                  {variants.find(v => v.id === selectedVariantId)?.options[0]?.optionValue?.value || 
                   variants.find(v => v.id === selectedVariantId)?.name || "N/A"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedVariantId}
            className="flex-1 bg-black hover:bg-gray-800"
          >
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
