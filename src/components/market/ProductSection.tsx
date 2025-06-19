"use client"

import { useRef, useEffect, useState } from "react"
import { SectionHeader } from "./SectionHeader"
import { ProductCard } from "./ProductCard"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Product {
  name: string
  price: number
  image: string
}

interface ProductSectionProps {
  title: string
  products: Product[]
  seeAllHref: string
}

export function ProductSection({ title, products, seeAllHref }: ProductSectionProps) {
  const [showSeeAll, setShowSeeAll] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        const isOverflowing = scrollRef.current.scrollWidth > scrollRef.current.clientWidth
        setShowSeeAll(isOverflowing)
      }
    }

    checkOverflow()
    window.addEventListener("resize", checkOverflow)
    return () => window.removeEventListener("resize", checkOverflow)
  }, [])

  return (
    <section className="space-y-4">
      <SectionHeader title={title} seeAllHref={seeAllHref} showSeeAll={showSeeAll} />
      <ScrollArea className="w-full">
        <div ref={scrollRef} className="flex space-x-4 pb-4">
          {products.map((product, index) => (
            <div key={index} className="min-w-[160px] sm:min-w-[200px]">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  )
}