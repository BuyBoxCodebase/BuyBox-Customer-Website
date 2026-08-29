"use client";

import React, {useState} from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { TrackImpression } from "@/components/analytics/TrackImpression";
import { trackEvent } from "@/lib/analytics/core";
import { ProductEventType } from "@/lib/analytics/constants";

export function MasonryProductCard({ 
  product, 
  hideBadge = false, 
  showAddToCart = false,
  dynamicBackground = false // TODO: Move color extraction to backend later
}: { 
  product: Product, 
  hideBadge?: boolean, 
  showAddToCart?: boolean,
  dynamicBackground?: boolean
}) {
  const salePrice = product.price ?? product.basePrice;
  const [dollars, cents] = salePrice.toLocaleString().split(".");
  const quantity = product.inventory?.quantity ?? 0;
  const isOutOfStock = quantity === 0;
  
  // Use the first image or fallback
  const mainImage = product.images?.[0] || product.defaultVariant?.images?.[0] || "/placeholder.svg";

  const [cardStyle, setCardStyle] = useState<{ bg: string; lum: number; ready: boolean }>({ bg: '', lum: 0, ready: !dynamicBackground });

  const analyzeImage = (img: HTMLImageElement) => {
    if (!dynamicBackground) return;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const w = 32;
      const h = 32;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);

      let rSum = 0, gSum = 0, bSum = 0, total = 0;
      let erSum = 0, egSum = 0, ebSum = 0, edgeTotal = 0;
      const border = 3;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          rSum += r; gSum += g; bSum += b; total++;

          const onEdge = x < border || y < border || x >= w - border || y >= h - border;
          if (onEdge) { erSum += r; egSum += g; ebSum += b; edgeTotal++; }
        }
      }

      const avg = { r: rSum / total, g: gSum / total, b: bSum / total };
      const edge = { r: erSum / edgeTotal, g: egSum / edgeTotal, b: ebSum / edgeTotal };

      const lum = (0.2126 * avg.r + 0.7152 * avg.g + 0.0722 * avg.b) / 255 * 100;
      const edgeCol = `rgb(${edge.r | 0}, ${edge.g | 0}, ${edge.b | 0})`;

      setCardStyle({ bg: edgeCol, lum, ready: true });
    } catch (err) {
      // Fallback on CORS error or other failure
      setCardStyle({ bg: '#1c1a1f', lum: 30, ready: true });
    }
  };

  const isDark = dynamicBackground && cardStyle.ready && cardStyle.lum <= 55;
  const titleColor = dynamicBackground 
    ? (isDark ? "text-gray-100 group-hover:text-white" : "text-gray-900 group-hover:text-black") 
    : "text-gray-800 group-hover:text-blue-600";

  const descColor = dynamicBackground
    ? (isDark ? "text-gray-300" : "text-gray-700")
    : "text-gray-500";

  const priceColor = dynamicBackground
    ? (isDark ? "text-gray-100" : "text-gray-900")
    : "text-red-500";

  return (
    <TrackImpression productId={product.id} categoryId={product.categoryId || undefined}>
      <Link 
        href={`/product/${product.id}`} 
        className={`relative flex flex-col h-full group break-inside-avoid rounded-xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-700 ${
          dynamicBackground 
            ? (cardStyle.ready ? "opacity-100 translate-y-0 border-white/10" : "opacity-0 translate-y-4 border-transparent") 
            : "bg-white border-gray-100"
        }`}
        style={dynamicBackground ? { backgroundColor: cardStyle.bg || '#1c1a1f' } : undefined}
        onClick={() => {
          trackEvent({
            type: ProductEventType.PRODUCT_CLICK,
            productId: product.id,
            categoryId: product.categoryId || undefined
          });
        }}
      >
        {/* Glow Layer (spans entire card behind everything) */}
        {dynamicBackground && cardStyle.ready && (
          <div 
            className="absolute inset-[-20%] bg-cover bg-center blur-[48px] saturate-150 scale-110 opacity-90 z-0"
            style={{ backgroundImage: `url(${mainImage})` }}
          />
        )}

        {/* Image Container */}
        <div className={`relative w-full ${dynamicBackground ? "" : "overflow-hidden bg-gray-50"}`}>
          <img
            src={mainImage}
            alt={product.name}
            crossOrigin={dynamicBackground ? "anonymous" : undefined}
            onLoad={dynamicBackground ? (e) => analyzeImage(e.currentTarget) : undefined}
            className={`w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 relative z-[1] ${
              dynamicBackground ? "[mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]" : ""
            }`}
            loading="lazy"
          />
          
          {!hideBadge && (
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 flex items-center z-[3]">
              <span className="italic mr-1">HOT</span> Seller
            </div>
          )}
        </div>

        {/* Scrim Veil (spans entire card to provide contrast for text) */}
        {dynamicBackground && cardStyle.ready && (
          <div className={`absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b ${
            isDark 
              ? "from-transparent via-black/20 to-black/80" 
              : "from-transparent via-white/20 to-white/90"
          }`} />
        )}

        <div className={`flex flex-col justify-between flex-1 relative z-[3] ${showAddToCart ? 'p-4' : 'p-3'} ${dynamicBackground ? '-mt-8' : ''}`}>
          <div>
            <h3 className={`text-sm font-medium line-clamp-2 leading-tight transition-colors ${titleColor}`}>
              {product.name}
            </h3>
            
            <p className={`text-xs mt-1 line-clamp-1 ${descColor}`}>
              {product.description}
            </p>
            
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`font-bold text-lg ${priceColor}`}>
                ${dollars}
              </span>
              <span className={`font-bold text-xs ${priceColor}`}>
                {cents ? `.${cents}` : ".00"}
              </span>
            </div>
          </div>

          {showAddToCart && (
            <div className={`mt-3 pt-3 border-t ${dynamicBackground ? (isDark ? "border-white/10" : "border-black/10") : "border-gray-100"}`}>
              <AddToCartButton 
                product={product} 
                className="w-full h-9 sm:h-10 px-4 py-2 text-xs sm:text-sm font-medium rounded-full" 
              />
            </div>
          )}
        </div>
      </Link>
    </TrackImpression>
  );
}
