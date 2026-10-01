import Link from "next/link";
import Image from "next/image";

export function LinoProductCarousel({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="flex overflow-x-auto gap-4 py-2 mt-3 snap-x pb-4">
      {products.map((product) => (
        <Link key={product.id} href={`/product/${product.id}`} className="block min-w-[160px] max-w-[160px] snap-center bg-white sys-dark:bg-[#0a0a0a] border border-gray-200 sys-dark:border-white/15 rounded-xl p-3 hover:border-black sys-dark:hover:border-white transition-colors">
          <div className="w-full h-24 bg-gray-100 sys-dark:bg-white/5 rounded-lg mb-3 relative overflow-hidden flex items-center justify-center">
            {product.image ? (
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            ) : (
              <span className="text-xs text-gray-400">No Image</span>
            )}
          </div>
          <h4 className="font-semibold text-sm line-clamp-1 text-black sys-dark:text-white">{product.name}</h4>
          <p className="text-black sys-dark:text-white font-bold text-sm mt-1">${product.price}</p>
        </Link>
      ))}
    </div>
  );
}
