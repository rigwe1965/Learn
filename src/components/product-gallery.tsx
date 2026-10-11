import Image from "next/image";
import type { Product } from "@/data/catalog";

// One photo per product for now: show it in full, then as a close-up crop.
export function ProductGallery({ product }: { product: Product }) {
  const sizes = "(min-width: 1024px) 58vw, 100vw";
  return (
    <div className="grid gap-2 md:gap-3 md:grid-cols-2 lg:grid-cols-1">
      <div className="media-product !aspect-[4/5]">
        <Image
          src={product.image}
          alt={product.alt}
          fill
          priority
          sizes={sizes}
          className="object-cover"
        />
      </div>
      <div className="media-product !aspect-[4/5]">
        <Image
          src={product.image}
          alt={`${product.name}, close-up`}
          fill
          sizes={sizes}
          className="origin-[50%_35%] scale-[1.9] object-cover"
        />
      </div>
    </div>
  );
}
