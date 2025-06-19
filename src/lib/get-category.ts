import { Category } from "@/types/category";
import axios from "axios";

export const getCategories = async ():Promise<Category[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/category/get`
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
};
