import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  name: string
  price: number
  image: string
}

export function ProductCard({ name, price, image }: ProductCardProps ) {
  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">{name}</h3>
          <p className="text-sm text-gray-600">${price.toFixed(2)}</p>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}