"use client";

import { SubCategory } from "@/types/category";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card-hover-effect";
import Autoplay from "embla-carousel-autoplay";

interface SubCatSectionProps {
  subcategories: SubCategory[];
  categoryTitle: string;
  isLast?: boolean;
}

export default function SubCatSection({
  categoryTitle,
  subcategories,
  isLast = false, 
}: SubCatSectionProps) {
  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  return (
    <>
      <section className="mb-8 overflow-hidden">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 1500,
            }),
          ]}
          className="w-full"
        >
          <div className="flex flex-wrap justify-between items-center mb-4 pr-4">
            <h2 className="whitespace-normal break-words w-auto text-xl md:text-2xl lg:text-2xl font-bold pl-2 lg:pl-4">
              {categoryTitle}
            </h2>
            <div className="flex gap-2">
              <CarouselPrevious className="static transform-none md:flex" />
              <CarouselNext className="static transform-none md:flex" />
            </div>
          </div>

          <CarouselContent className="">
            {subcategories.map((subCategory, idx) => (
              <CarouselItem
                key={idx}
                className="pl-4 basis-auto shrink-0"
              >
                <Link
                  href={`/subcategory/${subCategory.categoryId}%2F${subCategory.name}`}
                  className="block group h-full"
                >
                  <Card className="transition-all duration-300">
                    {subCategory.imageUrl && (
                      <div className="aspect-[4/3] relative object-cover">
                        <img
                          src={subCategory.imageUrl}
                          alt={subCategory.name}
                          className="w-[298px] rounded-xl h-72 object-cover"
                        />
                      </div>
                    )}
                    <CardTitle className="group-hover:text-blue-600 transition-colors">
                      {subCategory.name}
                    </CardTitle>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {!isLast && <hr className="border-t border-gray-200 my-8" />}
    </>
  );
}