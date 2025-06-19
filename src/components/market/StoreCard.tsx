import Image from "next/image"
import Link from "next/link"

interface StoreCardProps {
  name: string
  logo: string
  href: string
}

export function StoreCard({ name, logo, href }: StoreCardProps) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 min-w-[100px]">
      <div className="relative w-16 h-16 rounded-full border-2 border-purple-500 p-0.5">
        <div className="relative w-full h-full rounded-full overflow-hidden">
          <Image src={logo || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
      </div>
      <span className="text-sm text-gray-700 text-center truncate w-full">{name}</span>
    </Link>
  )
}