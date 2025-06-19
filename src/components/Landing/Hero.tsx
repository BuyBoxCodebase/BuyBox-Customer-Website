"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import React from "react";
import Autoplay from "embla-carousel-autoplay";
import { images } from "@/constants/heroimages";

export default function Home() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <>
      {/* Mobile Version: Edge-to-Edge Carousel */}
      <div className="block lg:hidden">
        {/* <Link href="/deals"> */}
        <Carousel
          opts={{ loop: true }}
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          className="w-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-[16/9] relative">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {/* </Link> */}
      </div>

      {/* Desktop Version: Original Layout */}
      <div className="hidden lg:block container mx-auto pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.5fr] gap-8 lg:gap-12 items-center">
          {/* Left Section */}
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 tracking-tight">
              BuyBox
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 max-w-md mx-auto lg:mx-0">
              Discover Daily Deals, we've got you covered.
            </p>
            {/* <Button className="bg-[#FF6B00] hover:bg-[#e65f00] text-black text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto">
              <Link href="/market">Explore</Link>
            </Button> */}
          </div>

          {/* Right Section */}
          <div className="mt-6 lg:mt-0">
            {/* <Link href="/deals"> */}
            <Carousel
              opts={{ loop: true }}
              plugins={[plugin.current]}
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              className="w-full max-w-xs sm:max-w-md mx-auto lg:max-w-none">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[16/9] relative">
                      <Image
                        src={image.src || "/placeholder.svg"}
                        alt={image.alt}
                        fill
                        className="rounded-lg object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={index === 0}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            {/* </Link> */}
          </div>
        </div>

        {/* Bottom Section */}
        {/* <div className="flex justify-center mt-8 md:mt-16">
          <Link href="/market">
            <Button
              variant="outline"
              className="border-[#FF6B00] text-gray-800 hover:bg-[#FF6B00] hover:text-black text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto group"
            >
              View Products
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div> */}
      </div>
    </>
  );
}
