import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/db/queries";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/categories/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: `Shop ${category.name.toLowerCase()} from Atelier Nord.`,
  };
}

export default function CategoryPage(props: PageProps<"/categories/[slug]">) {
  return (
    <Suspense fallback={<main className="container-page py-16 text-muted">Loading…</main>}>
      <CategoryProducts params={props.params} />
    </Suspense>
  );
}

async function CategoryProducts({
  params,
}: {
  params: PageProps<"/categories/[slug]">["params"];
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <main>
      <nav aria-label="Breadcrumb" className="container-page label py-5 text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground" aria-current="page">
            {category.name}
          </li>
        </ol>
      </nav>

      <section className="container-page pb-16 lg:pb-24" aria-label={category.name}>
        <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
          <h1>{category.name}</h1>
          <p className="label text-muted">{products.length} items</p>
        </div>
        {products.length > 0 ? (
          <div className="product-grid product-grid-all border border-line">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-muted">Nothing here just yet. Please check back soon.</p>
        )}
        <div className="mt-8 text-center">
          <Link href="/products" className="label">
            View all products
          </Link>
        </div>
      </section>
    </main>
  );
}
