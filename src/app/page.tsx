import LandingClient from "@/components/Landing/LandingClient";
import { getCategories } from "@/lib/get-category";
import { Category } from "@/types/category";
import type { Viewport } from "next";

// Browser bar colour (Chrome on Android, older Safari) follows the page's light / dark background.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function LandingPage() {
  const categories = await getCategories();
  
  // Extract all subcategories from the categories list
  let allSubcategories: any[] = [];
  if (categories && categories.length > 0) {
    categories.forEach((cat: Category) => {
      if (cat.subCategories && cat.subCategories.length > 0) {
        allSubcategories = [...allSubcategories, ...cat.subCategories];
      }
    });
  }

  // Remove duplicates if any based on id
  const uniqueSubcategories = Array.from(
    new Map(allSubcategories.map(item => [item.id, item])).values()
  );

  return <LandingClient subcategories={uniqueSubcategories} />;
}