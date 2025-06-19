// components/PreviouslyBought.tsx
"use client"

import React from "react"
import Image from "next/image"

interface Item {
  id: number
  name: string
  image?: string
  // other fields if needed
}

interface Props {
  items: Item[]
}

export default function PreviouslyBought({ items }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className="bg-white p-4 rounded shadow">
          <div className="relative w-full h-32">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-cover rounded"
            />
          </div>
          <p className="mt-2 font-semibold text-sm">{item.name}</p>
        </div>
      ))}
    </div>
  )
}