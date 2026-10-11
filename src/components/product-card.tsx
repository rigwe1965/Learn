import Image from "next/image";
import Link from "next/link";
import { formatPrice, getStockState, type Product } from "@/data/catalog";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = getStockState(product.stock) === "out-of-stock";
  const badge = soldOut ? "Sold out" : product.badge;

  return (
    <article className="group relative p-3 md:p-5">
      <Link href={`/products/${product.slug}`} className="block hover:no-underline">
        <div className="media-product">
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
            className={`object-cover transition-transform duration-700 ease-soft group-hover:scale-105 ${
              soldOut ? "opacity-60" : ""
            }`}
          />
          {badge && (
            <span className="label absolute left-3 top-3 bg-background px-2 py-1">
              {badge}
            </span>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <p className="label text-muted">{product.category}</p>
          <h3 className="!font-sans !text-sm">{product.name}</h3>
          <p className="text-sm">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </article>
  );
}
