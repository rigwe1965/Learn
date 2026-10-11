import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/db/queries";

export const metadata: Metadata = {
  title: "All products",
  description: "Browse the full Atelier Nord collection.",
};

export default function ProductsPage() {
  return (
    <main>
      <nav aria-label="Breadcrumb" className="container-page label py-5 text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground" aria-current="page">
            All products
          </li>
        </ol>
      </nav>

      <Suspense fallback={<div className="container-page pb-16 lg:pb-24" aria-hidden />}>
        <ProductList />
      </Suspense>
    </main>
  );
}

async function ProductList() {
  const products = await getProducts();

  return (
    <section className="container-page pb-16 lg:pb-24" aria-label="All products">
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
        <h1>All products</h1>
        <p className="label text-muted">{products.length} items</p>
      </div>
      <div className="product-grid product-grid-all border border-line">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
