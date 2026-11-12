"use client";

import { useMemo } from "react";
import { useCity } from "@/hooks/city/useCity";
import Link from "next/link";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export function LinoProductCarousel({ products }: { products: any[] }) {
  const { priceFor } = useCity();
  const autoplay = useMemo(
    () => Autoplay({ delay: 2500, stopOnInteraction: true, stopOnMouseEnter: true }),
    [],
  );

  if (!products || products.length === 0) return null;

  const hasMore = products.length > 2;

  return (
    <Carousel
      opts={{ align: "start", loop: hasMore, dragFree: true }}
      plugins={hasMore ? [autoplay] : []}
      className="mt-3 w-full"
    >
      <CarouselContent className="-ml-4 py-2 pb-4">
        {products.map((product) => (
          <CarouselItem key={product.id} className="basis-[176px] pl-4">
            <Link
              href={`/product/${product.id}`}
              className="block w-[160px] bg-white sys-dark:bg-[#0a0a0a] border border-gray-200 sys-dark:border-white/15 rounded-xl p-3 hover:border-black sys-dark:hover:border-white transition-colors"
            >
              <div className="w-full h-24 bg-gray-100 sys-dark:bg-white/5 rounded-lg mb-3 relative overflow-hidden flex items-center justify-center">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">No Image</span>
                )}
              </div>
              <h4 className="font-semibold text-sm line-clamp-1 text-black sys-dark:text-white">{product.name}</h4>
              <p className="text-black sys-dark:text-white font-bold text-sm mt-1">${priceFor(Number(product.price) || 0).toFixed(2)}</p>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
