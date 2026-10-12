import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DataTable } from "@/components/data-table";
import { listAdminCategories } from "@/db/admin-queries";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-64" aria-hidden />}>
      <CategoriesList />
    </Suspense>
  );
}

async function CategoriesList() {
  const categories = await listAdminCategories();

  return (
    <section aria-labelledby="categories-title">
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
        <div>
          <h1 id="categories-title">Categories</h1>
          <p className="label mt-2 text-muted">{categories.length} categories</p>
        </div>
        <Link href="/admin/categories/new" className="btn">
          New category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted">No categories yet.</p>
      ) : (
        <DataTable
          caption="Categories"
          columns={[
            { label: "Name" },
            { label: "Slug" },
            { label: "Products", align: "right" },
            { label: "Actions", align: "right" },
          ]}
        >
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="py-4 pr-4">
                <Link href={`/admin/categories/${c.id}/edit`}>{c.name}</Link>
              </td>
              <td className="py-4 pr-4 text-muted">/{c.slug}</td>
              <td className="py-4 pr-4 text-right">{c.products}</td>
              <td className="py-4 text-right">
                <Link href={`/admin/categories/${c.id}/edit`} className="label link">
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
