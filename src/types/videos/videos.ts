import { Variant } from "../product";

export interface Video {
  id: string;
  productId: string;
  caption: string;
  size: string;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
  product: Price;
  variants: Variant[];
}

interface Price{
  basePrice: number;
}