"use client";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import usePopularProducts, { PopularProductSnapshot } from "@/hooks/products/usePopularProducts";

interface ProductRailProps {
  title: string;
  categoryId?: string;
  seeAllHref?: string;
}

export default function ProductRail({
  title,
  categoryId,
  seeAllHref,
}: ProductRailProps) {
  const { popularProducts, loading } = usePopularProducts(categoryId);

  if (loading) return <RailSkeleton title={title} />;

  if (popularProducts.length === 0) return null;
  return (
    <section className="mb-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 1500,
          }),
        ]}
        className="w-full"
      >
        <div className="flex flex-wrap items-center justify-between mb-4 pl-2 lg:pl-4 pr-2 lg:pr-4">
          <h2 className="text-xl md:text-2xl lg:text-2xl font-bold">{title}</h2>
          
          <div className="flex items-center gap-4">
            {seeAllHref && (
              <Link
                href={seeAllHref}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                See all &rarr;
              </Link>
            )}
            <div className="hidden md:flex gap-2">
              <CarouselPrevious className="static transform-none" />
              <CarouselNext className="static transform-none" />
            </div>
          </div>
        </div>

        <CarouselContent className="-ml-2 md:-ml-4 px-2 lg:px-4 pb-2">
          {popularProducts.map((snap: PopularProductSnapshot) => snap.product &&  (
              <CarouselItem
                key={snap.id}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <ProductCard product={snap.product} />
              </CarouselItem>
            )
          )}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

function RailSkeleton({ title }: { title: string }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 pl-2 lg:pl-4 pr-2 lg:pr-4">
        <h2 className="text-xl md:text-2xl lg:text-2xl font-bold">{title}</h2>
      </div>
      <div className="flex gap-3 md:gap-4 overflow-hidden px-2 lg:px-4 pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[160px] md:w-[200px] shrink-0">
            <div className="aspect-square w-full rounded-lg bg-gray-200 animate-pulse" />
            <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
