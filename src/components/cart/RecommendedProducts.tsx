// components/RecommendedProducts.tsx
"use client"

import React from "react"
import Image from "next/image"

interface Product {
  id: number
  name: string
  image?: string
}

interface Props {
  products: Product[]
}

export default function RecommendedProducts({ products }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white p-4 rounded shadow">
          <div className="relative w-full h-32">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover rounded"
            />
          </div>
          <p className="mt-2 font-semibold text-sm">{product.name}</p>
        </div>
      ))}
    </div>
  )
}