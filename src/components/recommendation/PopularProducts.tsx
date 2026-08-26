"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import { motion } from "framer-motion";
import usePopularProducts from "@/hooks/products/usePopularProducts";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface PopularProductsProps {
  categoryId: string;
}

export default function PopularProducts({ categoryId }: PopularProductsProps) {
  const { popularProducts, loading } = usePopularProducts(categoryId);

  if (loading) {
    return <PopularProductsSkeleton />;
  }

  if (popularProducts.length === 0) {
    return null;
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div className="mb-12 overflow-hidden" variants={itemVariants} initial="hidden" animate="visible">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 1500,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-6 pl-4 pr-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Most Popular
            </h2>
          </div>
          <div className="flex gap-2">
            <CarouselPrevious className="static transform-none flex" />
            <CarouselNext className="static transform-none flex" />
          </div>
        </div>
        
        <div className="relative">
          {/* Subtle background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 rounded-2xl -z-10 blur-xl" />
          
          <CarouselContent className="-ml-2 md:-ml-4 px-4 pb-2">
            {popularProducts.map((snapshot) => snapshot.product && (
              <CarouselItem key={snapshot.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2  lg:basis-1/3 xl:basis-1/4">
                <ProductCard product={snapshot.product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </motion.div>
  );
}

function PopularProductsSkeleton() {
  return (
    <section className="mb-12">
      <div className="mb-6 pl-4 pr-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex gap-4 overflow-hidden px-4 pb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-[180px] md:w-[220px] lg:w-[280px] shrink-0">
            <div className="aspect-square w-full rounded-xl bg-gray-200 animate-pulse" />
            <div className="mt-3 h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
