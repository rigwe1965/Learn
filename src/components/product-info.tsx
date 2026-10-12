import { formatPrice, getStockState, type Product } from "@/data/catalog";
import { AddToBagButton } from "./add-to-bag-button";
import { StockStatus } from "./stock-status";

const panel = "group border-t border-line py-5 [&_summary]:cursor-pointer [&_summary]:list-none";

export function ProductInfo({ product }: { product: Product }) {
  const soldOut = getStockState(product.stock) === "out-of-stock";

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
      <p className="label text-muted">{product.category}</p>
      <h1 className="mt-3 !text-3xl md:!text-5xl">{product.name}</h1>
      <p className="mt-4 text-xl">{formatPrice(product.price)}</p>

      <div className="mt-6">
        <StockStatus stock={product.stock} />
      </div>

      <p className="mt-8 max-w-prose text-base">{product.description}</p>

      <div className="mt-8">
        <AddToBagButton product={product} soldOut={soldOut} />
      </div>

      <div className="mt-10 border-b border-line">
        <details open className={panel}>
          <summary className="label flex items-center justify-between">
            Details <span aria-hidden className="transition-transform group-open:rotate-45">+</span>
          </summary>
          <ul className="mt-4 space-y-2 text-muted">
            {product.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </details>
        <details className={panel}>
          <summary className="label flex items-center justify-between">
            Shipping &amp; returns <span aria-hidden className="transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-4 text-muted">
            Complimentary shipping on orders over $250. Free returns within 30
            days of delivery.
          </p>
        </details>
      </div>
    </div>
  );
}
