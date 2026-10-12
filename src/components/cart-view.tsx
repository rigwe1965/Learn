"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";
import { formatPrice } from "@/data/catalog";
import { removeFromCart, setQuantity, useCart } from "@/lib/cart";

const FREE_SHIPPING_OVER = 250;

export function CartView() {
  const { items, count, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="border-t border-line py-12 text-center">
        <p className="text-muted">Your bag is empty.</p>
        <Link href="/products" className="btn btn-outline mt-8 inline-block">
          Continue shopping
        </Link>
      </div>
    );
  }

  const shipping = subtotal > FREE_SHIPPING_OVER ? "Complimentary" : "Calculated at checkout";

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <ul className="divider-y border-y border-line lg:col-span-8">
        {items.map((item) => (
          <li
            key={item.slug}
            className="grid grid-cols-[6rem_1fr] gap-4 py-6 sm:grid-cols-[8rem_1fr] sm:gap-6"
          >
            <Link href={`/products/${item.slug}`} className="relative block aspect-[4/5] bg-subtle">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(min-width: 640px) 8rem, 6rem"
                className="object-cover"
              />
            </Link>
            <div className="flex flex-col justify-between gap-4">
              <div className="flex justify-between gap-4">
                <div className="space-y-1">
                  <p className="label text-muted">{item.category}</p>
                  <h2 className="!font-sans !text-sm">
                    <Link href={`/products/${item.slug}`}>{item.name}</Link>
                  </h2>
                  <p className="text-sm text-muted">{formatPrice(item.price)}</p>
                </div>
                <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center border border-line"
                  role="group"
                  aria-label={`Quantity for ${item.name}`}
                >
                  <button
                    type="button"
                    className="size-10"
                    aria-label={`Decrease quantity of ${item.name}`}
                    onClick={() => setQuantity(item.slug, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm" aria-live="polite">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="size-10 disabled:opacity-40"
                    aria-label={`Increase quantity of ${item.name}`}
                    disabled={item.quantity >= item.stock}
                    onClick={() => setQuantity(item.slug, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  className="label text-muted"
                  onClick={() => removeFromCart(item.slug)}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside
        className="h-fit border border-line p-6 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:col-span-4"
        aria-label="Order summary"
      >
        <h2 className="label">Order summary</h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">
              Subtotal ({count} {count === 1 ? "item" : "items"})
            </dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Shipping</dt>
            <dd>{shipping}</dd>
          </div>
        </dl>
        <CheckoutButton items={items.map(({ slug, quantity }) => ({ slug, quantity }))} />
        <p className="mt-4 text-xs text-muted">
          Complimentary shipping on orders over {formatPrice(FREE_SHIPPING_OVER)}.
        </p>
      </aside>
    </div>
  );
}
