import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { removeProduct } from "@/app/(admin)/admin/actions";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { ProductForm } from "@/components/product-form";
import { StockForm } from "@/components/stock-form";
import { getAdminProduct, listAdminCategories } from "@/db/admin-queries";
import { parseId } from "@/lib/admin-validation";

export const metadata: Metadata = { title: "Edit product" };

export default function EditProductPage(props: PageProps<"/admin/products/[id]/edit">) {
  return (
    <Suspense fallback={<div className="min-h-64" aria-hidden />}>
      <EditProduct params={props.params} />
    </Suspense>
  );
}

async function EditProduct({
  params,
}: {
  params: PageProps<"/admin/products/[id]/edit">["params"];
}) {
  const id = parseId((await params).id);
  if (!id) notFound();

  const [product, categories] = await Promise.all([getAdminProduct(id), listAdminCategories()]);
  if (!product) notFound();

  return (
    <>
      <h1 className="mb-2">{product.name}</h1>
      <p className="label mb-8 text-muted md:mb-12">
        <Link href={`/products/${product.slug}`} className="link">
          View in store
        </Link>
      </p>

      <ProductForm product={product} categories={categories} />

      <section className="mt-12 border-t border-line pt-12" aria-labelledby="stock-title">
        <h2 id="stock-title" className="mb-6">
          Stock
        </h2>
        <StockForm productId={product.id} quantity={product.stock} />
      </section>

      <section className="mt-12 border-t border-line pt-12" aria-labelledby="delete-title">
        <h2 id="delete-title" className="mb-4">
          Delete product
        </h2>
        <p className="mb-6 max-w-prose text-sm text-muted">
          Removes the product and its stock from the store. It can&rsquo;t be undone.
        </p>
        <ConfirmDeleteButton
          action={removeProduct}
          id={product.id}
          label="Delete product"
          warning={`Delete ${product.name}? Shoppers will no longer be able to find it.`}
        />
      </section>
    </>
  );
}
