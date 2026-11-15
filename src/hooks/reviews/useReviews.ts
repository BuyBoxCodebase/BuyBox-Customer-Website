import { useCallback, useEffect, useState } from "react";
import axios from "axios";

// Keep in sync with MAX_COMMENT_LENGTH in the backend's review.service.ts
export const MAX_COMMENT_LENGTH = 500;
// Keep in sync with MAX_REVIEW_IMAGE_BYTES in the backend's review.controller.ts
export const MAX_REVIEW_IMAGE_MB = 5;

const BASE =`${process.env.NEXT_PUBLIC_BACKEND_URL}/review`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  imageUrl: string | null;
  createdAt: string;
  author: string;
  authorPic: string | null;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

export interface ProductReviews {
  summary: ReviewSummary;
  reviews: ReviewItem[];
  hasMore: boolean;
}

export interface MyReview {
  id: string;
  rating: number;
  comment: string | null;
  imageUrl: string | null;
}

export interface ReviewEligibility {
  canReview: boolean;
  myReview: MyReview | null;
}

export const useProductReviews = (productId: string | undefined) => {
  const [data, setData] = useState<ProductReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async () => {
    if (!productId) return;
    try {
      const res = await axios.get<ProductReviews>(`${BASE}/product/${productId}`);
      setData(res.data);
      setPage(1);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const loadMore = async () => {
    if (!productId || !data?.hasMore) return;
    setLoadingMore(true);
    try {
      const res = await axios.get<ProductReviews>(`${BASE}/product/${productId}`, {
        params: { page: page + 1 },
      });
      setData({
        ...res.data,
        reviews: [...data.reviews, ...res.data.reviews],
      });
      setPage(page + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  return { data, loading, loadingMore, loadMore, refresh: load };
};

// Only asks the backend when there's a signed-in customer; anonymous visitors never can rate
export const useReviewEligibility = (productId: string | undefined) => {
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!productId || !token) {
      setEligibility(null);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get<ReviewEligibility>(
        `${BASE}/product/${productId}/eligibility`,
        { headers: authHeaders() }
      );
      setEligibility(res.data);
    } catch {
      setEligibility(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  return { eligibility, loading, refresh: load };
};

// Sent as multipart so the photo travels with the rating
export const submitReview = async (
  productId: string,
  rating: number,
  comment: string,
  image: File | null,
  removeImage: boolean
) => {
  const form = new FormData();
  form.append("rating", String(rating));
  form.append("comment", comment);
  if (image) form.append("image", image);
  else if (removeImage) form.append("removeImage", "true");
  const res = await axios.put(`${BASE}/product/${productId}`, form, {
    headers: authHeaders(),
  });
  return res.data;
};
