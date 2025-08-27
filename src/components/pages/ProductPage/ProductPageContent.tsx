"use client";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/context/CartContext";
import { useEventTracking, usePageTracking } from "@/hooks/analytics";
import useGetProductWithVariants from "@/hooks/products/useGetProductWithVariants";
import { useToast } from "@/hooks/toast/use-toast";
import { OptionGroupDisplay, SelectedOptions } from "@/types/product";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductSkeleton from "./ProductSkeleton";
import { PackageOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProductImageCarousel from "./ProductImageCarousel";
import ProductDetails from "./ProductDetails";
import { motion } from "framer-motion";

export default function ProductPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const token =
    typeof window != "undefined" ? localStorage.getItem("token") : null;
  usePageTracking();

  const { product, loading, error, isVariant } = useGetProductWithVariants(id);
  const { addProductToCart } = useCartContext();
  const { trackAddtoCart } = useEventTracking();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const [availableOptions, setAvailableOptions] = useState<
    OptionGroupDisplay[]
  >([]);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({});

  const selectedVariant =
    product?.selectedVariant ||
    (isVariant ? product?.variants?.find((v) => v.id === id) : null);

  const displayData = selectedVariant
    ? {
        ...product,
        images: selectedVariant.images,
        price: selectedVariant.price,
        inventory: selectedVariant.inventory,
      }
    : product?.defaultVariant
    ? {
        ...product,
        images: product.defaultVariant.images,
        price: product.defaultVariant.price,
        inventory: product.defaultVariant.inventory,
      }
    : product;

  useEffect(() => {
    if (product) {
      const optionGroups: OptionGroupDisplay[] = [];
      if (product.options && Array.isArray(product.options)) {
        product.options.forEach((group) => {
          // Check if group.values exists and has at least one item
          if (
            group.values &&
            group.values.length > 0 &&
            group.values[0].option
          ) {
            optionGroups.push({
              name: group.values[0].option.name,
              values: group.values.map((val) => ({
                id: val.id,
                value: val.value,
              })),
            });
          }
        });
      }

      if (
        optionGroups.length === 0 &&
        product.sizes &&
        Array.isArray(product.sizes)
      ) {
        optionGroups.push({
          name: "Size",
          values: product.sizes.map((size) => ({ id: size, value: size })),
        });
      }
      setAvailableOptions(optionGroups);

      let currentVariant = selectedVariant;
      if (!currentVariant) {
        if (id) {
          currentVariant = product.variants?.find((v) => v.id === id);
        }
        if (!currentVariant) {
          currentVariant = product.defaultVariant;
        }
      }

      const defaults: SelectedOptions = {};

      if (currentVariant && currentVariant.options) {
        currentVariant.options.forEach(
          (opt: { optionValue: { value: string } }) => {
            if (product.options) {
              product.options.forEach((group) => {
                // Check if group.values exists and has items
                if (group.values && group.values.length > 0) {
                  group.values.forEach((val) => {
                    if (val.value === opt.optionValue.value && val.option) {
                      defaults[val.option.name] = val.id;
                    }
                  });
                }
              });
            }
          }
        );
      }

      optionGroups.forEach((group) => {
        if (!defaults[group.name] && group.values.length > 0) {
          defaults[group.name] = group.values[0].id;
        }
      });

      setSelectedOptions(defaults);
    }
  }, [product, id, selectedVariant]);

  const getInventoryQuantity = () => {
    if (displayData && "inventory" in displayData) {
      if (Array.isArray(displayData.inventory)) {
        return displayData.inventory[0]?.quantity ?? 0;
      } else if (displayData.inventory) {
        return displayData.inventory.quantity ?? 0;
      }
    }
    return 0;
  };

  const inventoryQuantity = getInventoryQuantity();

  const getPrice = () => {
    if (displayData) {
      if (typeof displayData.basePrice === "number") {
        return displayData.basePrice;
      }
    }
    return 0;
  };

  const displayPrice = getPrice();

  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const increaseQuantity = () => {
    if (displayData && quantity < inventoryQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = async () => {
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
    if (token && product) {
      setIsAddingToCart(true);
      try {
        let variantId;

        if (selectedVariant) {
          variantId = selectedVariant.id;
        } else if (product.defaultVariant) {
          variantId = product.defaultVariant.id;
        }

        const cartItem = {
          productId: product.id,
          quantity,
          variantId: variantId || null,
        };
        // console.log("Adding Cart Item:", cartItem);

        await addProductToCart([cartItem]);
        trackAddtoCart(product.id, quantity, displayPrice);
        toast({
          title: `${quantity} Items added to cart`,
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
        setIsAddingToCart(false);
      }
    }
  };

  const handleOptionSelect = (groupName: string, optionId: string) => {
    const newOptions = { ...selectedOptions, [groupName]: optionId };
    setSelectedOptions(newOptions);

    const selectedValues = new Set();
    Object.entries(newOptions).forEach(([groupName, optionId]) => {
      if (product?.options) {
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

    const matchingVariant = product?.variants?.find((variant) =>
      variant.options?.every((opt) => selectedValues.has(opt.optionValue.value))
    );

    if (matchingVariant) {
      router.push(`/product/${matchingVariant.id}`);
    }
  };

  if (loading) return <ProductSkeleton />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-500 text-lg font-medium">{error}</p>
        </motion.div>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-orange-50 rounded-lg border border-orange-200">
          <PackageOpen className="mx-auto h-12 w-12 text-gray-800 mb-4" />
          <p className="text-orange-700 text-lg font-medium">
            Product not found.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/")}>
            Browse Products
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto pb-4 pt-2 md:pt-2 md:px-4 lg:px-8 xl:container">
      {/* Desktop & tablet (md and above) with Card */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Left side: Carousel with mobile-specific padding removed */}
              <div className="w-full md:w-1/2 px-0 pt-1">
                <ProductImageCarousel
                  images={displayData?.images || product.images || []}
                  productName={product.name}
                />
              </div>
              {/* Right side: Details */}
              <div className="w-full px-4 md:w-1/2">
                <ProductDetails
                  product={product}
                  displayPrice={displayPrice}
                  availableOptions={availableOptions}
                  quantity={quantity}
                  onDecrease={decreaseQuantity}
                  onIncrease={increaseQuantity}
                  inventoryQuantity={inventoryQuantity}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={isAddingToCart}
                  onSelectOption={handleOptionSelect}
                  selectedOptions={selectedOptions}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile (below md) without Card */}
      <div className="block md:hidden">
        <div className="sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Left side: Carousel with mobile-specific padding removed */}
            <div className="w-full md:w-1/2">
              <ProductImageCarousel
                images={displayData?.images || product.images || []}
                productName={product.name}
              />
            </div>
            {/* Right side: Details */}
            <div className="w-full px-4 md:w-1/2">
              <ProductDetails
                product={product}
                displayPrice={displayPrice}
                availableOptions={availableOptions}
                quantity={quantity}
                onDecrease={decreaseQuantity}
                onIncrease={increaseQuantity}
                inventoryQuantity={inventoryQuantity}
                onAddToCart={handleAddToCart}
                isAddingToCart={isAddingToCart}
                onSelectOption={handleOptionSelect}
                selectedOptions={selectedOptions}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
