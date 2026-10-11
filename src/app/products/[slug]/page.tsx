import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductInfo } from "@/components/product-info";
import { SectionHeading } from "@/components/section-heading";
import {
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/db/queries";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default function ProductPage(props: PageProps<"/products/[slug]">) {
  return (
    <Suspense fallback={<main className="container-page py-16 text-muted">Loading…</main>}>
      <ProductDetails params={props.params} />
    </Suspense>
  );
}

async function ProductDetails({
  params,
}: {
  params: PageProps<"/products/[slug]">["params"];
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <main>
      <nav aria-label="Breadcrumb" className="container-page label py-5 text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li>{product.category}</li>
          <li aria-hidden>/</li>
          <li className="text-foreground" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <section className="container-page grid gap-8 pb-16 lg:grid-cols-12 lg:gap-12 lg:pb-24">
        <div className="lg:col-span-7">
          <ProductGallery product={product} />
        </div>
        <div className="lg:col-span-5">
          <ProductInfo product={product} />
        </div>
      </section>

      <section className="container-page section pt-0 lg:pt-0" aria-label="You may also like">
        <SectionHeading title="You may also like" />
        <div className="product-grid product-grid-related border border-line">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
