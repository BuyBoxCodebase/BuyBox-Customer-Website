"use client"

import { useRef, useEffect, useState } from "react"
import { SectionHeader } from "./SectionHeader"
import { StoreCard } from "./StoreCard"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const stores = [
  { name: "Smart Shop", logo: "/placeholder.svg", href: "/store/smart-shop" },
  { name: "Lorem Store", logo: "/placeholder.svg", href: "/store/lorem-store" },
  { name: "Smart Shop", logo: "/placeholder.svg", href: "/store/smart-shop-2" },
  { name: "Lorem Store", logo: "/placeholder.svg", href: "/store/lorem-store-2" },
  { name: "Smart Shop", logo: "/placeholder.svg", href: "/store/smart-shop-3" },
  { name: "Lorem Store", logo: "/placeholder.svg", href: "/store/lorem-store-3" },
  { name: "Smart Shop", logo: "/placeholder.svg", href: "/store/smart-shop-4" },
  { name: "Lorem Store", logo: "/placeholder.svg", href: "/store/lorem-store-4" },
]

export function FeaturedStores() {
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
      <SectionHeader title="Featured Stores" seeAllHref="/stores" showSeeAll={showSeeAll} />
      <ScrollArea className="w-full">
        <div ref={scrollRef} className="flex space-x-6 pb-4">
          {stores.map((store, index) => (
            <StoreCard key={index} {...store} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  )
}