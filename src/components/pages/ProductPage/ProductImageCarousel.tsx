import {
  Carousel,
  CarouselContent,
  CarouselDotIndicators,
  CarouselItem,
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
              <CarouselItem
                key={index}
                className="relative aspect-[4/5] sm:aspect-[5/6] md:aspect-square overflow-hidden rounded-lg">
                <motion.div
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full">
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`${productName} - image ${index + 1}`}
                    fill
                    className="object-contain sm:object-cover"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index === 0}
                  />
                </motion.div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem className="relative aspect-[4/5] sm:aspect-[5/6] md:aspect-square overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg"
                alt={productName}
                fill
                className="object-contain sm:object-cover"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                priority
              />
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselDotIndicators />
      </Carousel>
    </motion.div>
  );
}