import type { Metadata } from "next";
import Link from "next/link";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Bag",
};

export default function CartPage() {
  return (
    <main>
      <nav aria-label="Breadcrumb" className="container-page label py-5 text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground" aria-current="page">
            Bag
          </li>
        </ol>
      </nav>

      <section className="container-page pb-16 lg:pb-24" aria-labelledby="cart-title">
        <h1 id="cart-title" className="mb-8 md:mb-12">
          Bag
        </h1>
        <CartView />
      </section>
    </main>
  );
}
