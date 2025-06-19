export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
}
