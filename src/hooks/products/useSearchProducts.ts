import { useState, useEffect } from 'react';
import { Product, ProductsByCategory } from '@/types/product';
import Fuse from 'fuse.js';

export const useSearchProducts = (products: ProductsByCategory, searchQuery: string) => {
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  useEffect(() => {
    // Flatten all category arrays into a single array of products
    const allProducts = Object.values(products).flat();

    // If no search query provided, return all products
    if (!searchQuery.trim()) {
      setSearchResults(allProducts);
      return;
    }

    // Configure Fuse.js for fuzzy searching
    const options = {
      keys: [
        'name',
        'description',
        'category.name',
        'subCategory.name'
      ],
      threshold: 0.2, // Adjust this value to make matching more or less fuzzy
    };

    const fuse = new Fuse(allProducts, options);
    const fuseResults = fuse.search(searchQuery);

    // Map Fuse results back to the product items
    setSearchResults(fuseResults.map(result => result.item));
  }, [products, searchQuery]);

  return { searchResults };
};