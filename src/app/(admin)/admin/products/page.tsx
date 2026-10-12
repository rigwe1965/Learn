import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { stockLabel } from "@/components/stock-status";
import { DataTable } from "@/components/data-table";
import { listAdminProducts } from "@/db/admin-queries";
import { formatPrice } from "@/data/catalog";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-64" aria-hidden />}>
      <ProductsList />
    </Suspense>
  );
}

async function ProductsList() {
  const products = await listAdminProducts();

  return (
    <section aria-labelledby="products-title">
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
        <div>
          <h1 id="products-title">Products</h1>
          <p className="label mt-2 text-muted">{products.length} items</p>
        </div>
        <Link href="/admin/products/new" className="btn">
          New product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-muted">No products yet.</p>
      ) : (
        <DataTable
          caption="Products"
          columns={[
            { label: "Name" },
            { label: "Category" },
            { label: "Price", align: "right" },
            { label: "Stock" },
            { label: "Actions", align: "right" },
          ]}
        >
          {products.map((p) => (
            <tr key={p.id}>
              <td className="py-4 pr-4">
                <Link href={`/admin/products/${p.id}/edit`}>{p.name}</Link>
                <p className="text-xs text-muted">/{p.slug}</p>
              </td>
              <td className="py-4 pr-4 text-muted">{p.category}</td>
              <td className="py-4 pr-4 text-right">{formatPrice(p.priceCents / 100)}</td>
              <td className="py-4 pr-4">
                {p.stock} <span className="text-muted">· {stockLabel(p.stock)}</span>
              </td>
              <td className="py-4 text-right">
                <Link href={`/admin/products/${p.id}/edit`} className="label link">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </section>
  );
}
