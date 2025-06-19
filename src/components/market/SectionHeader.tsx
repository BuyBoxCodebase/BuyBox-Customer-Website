import Link from "next/link"

interface SectionHeaderProps {
  title: string
  seeAllHref: string
  showSeeAll?: boolean
}

export function SectionHeader({ title, seeAllHref, showSeeAll = false }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {showSeeAll && (
        <Link href={seeAllHref} className="text-purple-600 text-sm hover:text-purple-700">
          See All
        </Link>
      )}
    </div>
  )
}