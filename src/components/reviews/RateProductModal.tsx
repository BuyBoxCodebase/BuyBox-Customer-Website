"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/toast/use-toast";
import {
  MAX_COMMENT_LENGTH,
  MAX_REVIEW_IMAGE_MB,
  submitReview,
  useReviewEligibility,
} from "@/hooks/reviews/useReviews";
import { AnimatedEmoji, EMOJIS } from "./RatingEmoji";

// The same form the product page used inline; now it lives inside the modal so
// the order page can open it for any product in a completed order.
function RatingForm({
  productId,
  initialRating,
  initialComment,
  initialImageUrl,
  onSaved,
}: {
  productId: string;
  initialRating: number;
  initialComment: string;
  initialImageUrl: string | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [saving, setSaving] = useState(false);
  // One photo per review: a newly picked file, or the saved one (which can be removed)
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const isEdit = initialRating > 0;

  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment);
    setFile(null);
    setRemoveExisting(false);
  }, [initialRating, initialComment, initialImageUrl]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shownImage = preview ?? (removeExisting ? null : initialImageUrl);

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      toast({ title: "Please choose an image file", variant: "destructive", className: "top-[4rem]" });
      return;
    }
    if (picked.size > MAX_REVIEW_IMAGE_MB * 1024 * 1024) {
      toast({
        title: `Image must be ${MAX_REVIEW_IMAGE_MB}MB or smaller`,
        variant: "destructive",
        className: "top-[4rem]",
      });
      return;
    }
    setFile(picked);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setRemoveExisting(!!initialImageUrl);
  };

  const handleSubmit = async () => {
    if (rating < 1) return;
    setSaving(true);
    try {
      await submitReview(productId, rating, comment, file, removeExisting);
      toast({
        title: isEdit ? "Rating updated" : "Thanks for rating!",
        className: "top-[4rem]",
      });
      onSaved();
    } catch (err: any) {
      toast({
        title: "Couldn't save your rating",
        description: err?.response?.data?.message || "Please try again.",
        variant: "destructive",
        className: "top-[4rem]",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tighter spacing on small screens so all 5 faces stay on one line, like desktop */}
      <div
        className="flex flex-nowrap gap-1 sm:gap-2 justify-center"
        onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n === (hover || rating);
          return (
            <button
              key={n}
              type="button"
              aria-label={EMOJIS[n].label}
              aria-pressed={n === rating}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className={`flex flex-col items-center rounded-lg px-1 py-1 sm:px-2 transition ${active ? "bg-gray-100 scale-110" : "opacity-50 grayscale"
                }`}>
              <AnimatedEmoji emoji={EMOJIS[n]} size={36} />
              <span className="text-[10px] mt-1 whitespace-nowrap">
                {EMOJIS[n].label}
              </span>
            </button>
          );
        })}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={MAX_COMMENT_LENGTH}
        rows={3}
        placeholder="Share what you thought (optional)"
        className="w-full rounded-md border p-2 text-sm"
      />
      <p
        className={`text-right text-xs ${comment.length >= MAX_COMMENT_LENGTH ? "text-red-600" : "text-gray-400"
          }`}>
        {comment.length}/{MAX_COMMENT_LENGTH}
      </p>
      <div className="space-y-2">
        {shownImage ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shownImage}
              alt="Your review photo"
              className="h-24 w-24 rounded-md object-cover border"
            />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={handleRemoveImage}
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-black text-white text-xs">
              ✕
            </button>
          </div>
        ) : (
          <label className="inline-block cursor-pointer rounded-md border border-dashed px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Add a photo (optional)
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePickImage}
            />
          </label>
        )}
      </div>
      <Button onClick={handleSubmit} disabled={rating < 1 || saving} className="w-full">
        {saving ? "Saving..." : isEdit ? "Update rating" : "Submit rating"}
      </Button>
    </div>
  );
}

export default function RateProductModal({
  productId,
  productName,
  open,
  onOpenChange,
  onSaved,
}: {
  productId: string;
  productName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  // Passing undefined while closed keeps the eligibility fetch from firing;
  // it runs fresh every time the modal opens.
  const { eligibility, loading, refresh } = useReviewEligibility(
    open ? productId : undefined
  );

  const isEdit = !!eligibility?.myReview;

  const handleSaved = () => {
    refresh();
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update your rating" : "Rate this product"}</DialogTitle>
          {productName && (
            <DialogDescription className="truncate">
              {productName}
            </DialogDescription>
          )}
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : !eligibility ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">
              Sign in to rate this product.
            </p>
            <Button asChild>
              <Link href="/user/login">Sign in</Link>
            </Button>
          </div>
        ) : !eligibility.canReview ? (
          <p className="text-sm text-gray-600 py-2">
            You can rate this product once your order is completed.
          </p>
        ) : (
          <RatingForm
            productId={productId}
            initialRating={eligibility.myReview?.rating ?? 0}
            initialComment={eligibility.myReview?.comment ?? ""}
            initialImageUrl={eligibility.myReview?.imageUrl ?? null}
            onSaved={handleSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
