import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { getNewArrivals } from "@/db/queries";

export const metadata: Metadata = {
  title: "New arrivals",
  description: "The latest pieces from Atelier Nord.",
};

export default function NewArrivalsPage() {
  return (
    <main>
      <nav aria-label="Breadcrumb" className="container-page label py-5 text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground" aria-current="page">
            New arrivals
          </li>
        </ol>
      </nav>

      <Suspense fallback={<div className="container-page pb-16 lg:pb-24" aria-hidden />}>
        <NewArrivalsList />
      </Suspense>
    </main>
  );
}

async function NewArrivalsList() {
  const products = await getNewArrivals();

  return (
    <section className="container-page pb-16 lg:pb-24" aria-label="New arrivals">
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
        <h1>New arrivals</h1>
        <p className="label text-muted">{products.length} items</p>
      </div>
      {products.length > 0 ? (
        <div className="product-grid product-grid-all border border-line">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-muted">Nothing new just yet. Please check back soon.</p>
      )}
      <div className="mt-8 text-center">
        <Link href="/products" className="label">
          View all products
        </Link>
      </div>
    </section>
  );
}
