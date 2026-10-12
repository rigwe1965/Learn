import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductForm } from "@/components/product-form";
import { listAdminCategories } from "@/db/admin-queries";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <section aria-labelledby="new-product-title">
      <h1 id="new-product-title" className="mb-8 md:mb-12">
        New product
      </h1>
      <Suspense fallback={<div className="min-h-64" aria-hidden />}>
        <NewProductForm />
      </Suspense>
    </section>
  );
}

async function NewProductForm() {
  const categories = await listAdminCategories();

  if (categories.length === 0) {
    return (
      <p className="text-muted">
        Products need a category.{" "}
        <Link href="/admin/categories/new" className="link">
          Create one first
        </Link>
        .
      </p>
    );
  }
  return <ProductForm categories={categories} />;
}
