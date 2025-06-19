export interface Product {
  id: string;
  brandId: string;
  name: string;
  description: string;
  images: string[];
  categoryId: string;
  subCategoryId: string | null;
  basePrice: number;
  price?: number;
  attributes?: Record<string, any>;
  category: {
    id: string;
    name: string;
    imageUrl: string;
  };
  subCategory?: {
    id: string;
    name: string;
    imageUrl: string;
    categoryId: string;
  } | null;
  options?: ProductOption[];
  sizes?: string[];
  variants: Variant[];
  defaultVariant?: Variant | null;
  selectedVariant?: Variant | null;
  inventory?: VariantInventory;
}

export interface ProductOption {
  id: string;
  name?: string;
  values: OptionValueWithOption[];
}

export interface OptionValueWithOption {
  id: string;
  value: string;
  option: {
    id: string;
    name: string;
  };
}

export interface Variant {
  id: string;
  productId?: string;
  name?: string;
  description?: string;
  price: number;
  isDefault: boolean;
  images: string[];
  inventory: VariantInventory[]; // Updated: now an array
  options: VariantOption[];
  isSelected?: boolean;
}

export interface VariantInventory {
  variantId?: string;
  quantity: number;
}

export interface VariantOption {
  id: string;
  variantId?: string;
  optionValueId?: string;
  optionValue: {
    id?: string;
    value: string;
    option?: {
      id: string;
      name: string;
    };
  };
}

export interface ProductsByCategory {
  [key: string]: Product[];
}

export interface SelectedOptions {
  [optionName: string]: string;
}

export interface OptionGroupDisplay {
  name: string;
  values: {
    id: string;
    value: string;
  }[];
}