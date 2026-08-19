// src/hooks/customer/useUpdateInterests.ts
import { useState } from "react";
import axios from "axios";

interface UpdateInterestsResponse {
  success: boolean;
  message: string;
  interests?: string[];
}

const useUpdateInterests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateInterests = async (
    categoryIds: string[]
  ): Promise<UpdateInterestsResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch<UpdateInterestsResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/profile/interests`,
        { categoryIds },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      return { success: false, message: (err as any).message };
    }
  };

  return { updateInterests, loading, error };
};

export default useUpdateInterests;
