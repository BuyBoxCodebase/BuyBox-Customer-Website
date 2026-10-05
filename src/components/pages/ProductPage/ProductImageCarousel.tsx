import {
  Carousel,
  CarouselContent,
  CarouselDotIndicators,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ProductImageCarousel({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const hasMultipleImages = images && images.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
      <Carousel className="relative w-full">
        <CarouselContent>
          {images && images.length > 0 ? (
            images.map((img, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-square overflow-hidden md:rounded-lg">
                  <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full">
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${productName} - image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index === 0}
                    />
                  </motion.div>
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="relative aspect-square overflow-hidden md:rounded-lg">
                <Image
                  src="/placeholder.svg"
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                  priority
                />
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        {hasMultipleImages && (
          <>
            <CarouselPrevious className="left-2 p-2 rounded-full bg-white/90 text-black shadow-md border-0 hover:bg-white disabled:opacity-0" />
            <CarouselNext className="right-2 p-2 rounded-full bg-white/90 text-black shadow-md border-0 hover:bg-white disabled:opacity-0" />
          </>
        )}
        <CarouselDotIndicators />
      </Carousel>
    </motion.div>
  );
}