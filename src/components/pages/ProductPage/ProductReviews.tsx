"use client";

import { useMemo } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useProductReviews } from "@/hooks/reviews/useReviews";
import { AnimatedEmoji, EMOJIS, emojiFor, Face } from "@/components/reviews/RatingEmoji";


export default function ProductReviews({ productId }: { productId: string }) {
  const { data, loading, loadingMore, loadMore } =
    useProductReviews(productId);

  const summary = data?.summary;
  const reviews = data?.reviews ?? [];

  // Auto-scroll like the other carousels in the app. Only once there are enough
  // slides to loop smoothly (3 cards visible on desktop); pauses while hovering.
  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 4000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    []
  );
  const plugins = useMemo(
    () => (reviews.length > 3 ? [autoplay] : []),
    [autoplay, reviews.length]
  );

  return (
    <section className="mt-12 md:mt-16 px-4" id="reviews">
      <Carousel
        opts={{ align: "start", loop: reviews.length > 3 }}
        plugins={plugins}
        className="w-full"
        aria-label="Customer reviews">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Ratings &amp; reviews</h2>
          {reviews.length > 1 && (
            <div className="flex gap-2">
              <CarouselPrevious className="static transform-none flex" />
              <CarouselNext className="static transform-none flex" />
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading ratings...</p>
        ) : (
          <div className="space-y-6">
            {summary && summary.count > 0 ? (
              <div className="flex flex-row gap-4 sm:gap-6">
                <div className="flex flex-col items-center justify-center sm:w-40">
                  <Face value={summary.average} size={44} />
                  <span className="text-sm font-medium mt-1">
                    {emojiFor(summary.average).label}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    {summary.count} rating{summary.count > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const c = summary.distribution[n] ?? 0;
                    const pct = summary.count ? (c / summary.count) * 100 : 0;
                    return (
                      <div key={n} className="flex items-center gap-2 text-sm">
                        <span className="w-6">
                          <AnimatedEmoji emoji={EMOJIS[n]} size={20} />
                        </span>
                        <div className="h-2 flex-1 rounded bg-gray-200">
                          <div
                            className="h-2 rounded bg-yellow-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-gray-500">{c}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No ratings yet.</p>
            )}

            {reviews.length > 0 && (
              <CarouselContent className="-ml-4">
                {reviews.map((r) => (
                  <CarouselItem
                    key={r.id}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="flex h-full flex-col gap-2 rounded-lg border p-4">
                      <div className="flex items-center gap-2">
                        <Face value={r.rating} size={18} />
                        <span className="text-sm font-medium truncate">
                          {r.author}
                        </span>
                        <span className="ml-auto whitespace-nowrap text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-5">
                          {r.comment}
                        </p>
                      )}
                      {r.imageUrl && (
                        <a
                          href={r.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto self-start">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.imageUrl.replace("/upload/", "/upload/w_400,c_limit,q_auto/")}
                            alt="Photo from the customer's review"
                            loading="lazy"
                            className="h-24 w-24 rounded-md object-cover border"
                          />
                        </a>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            )}

            {data?.hasMore && (
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? "Loading..." : "Show more reviews"}
              </Button>
            )}
          </div>
        )}
      </Carousel>
    </section>
  );
}
