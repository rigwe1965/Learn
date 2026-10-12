import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { removeCategory } from "@/app/(admin)/admin/actions";
import { CategoryForm } from "@/components/category-form";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { getAdminCategory } from "@/db/admin-queries";
import { parseId } from "@/lib/admin-validation";

export const metadata: Metadata = { title: "Edit category" };

export default function EditCategoryPage(props: PageProps<"/admin/categories/[id]/edit">) {
  return (
    <Suspense fallback={<div className="min-h-64" aria-hidden />}>
      <EditCategory params={props.params} />
    </Suspense>
  );
}

async function EditCategory({
  params,
}: {
  params: PageProps<"/admin/categories/[id]/edit">["params"];
}) {
  const id = parseId((await params).id);
  if (!id) notFound();

  const category = await getAdminCategory(id);
  if (!category) notFound();

  return (
    <>
      <h1 className="mb-8 md:mb-12">{category.name}</h1>
      <CategoryForm category={category} />

      <section className="mt-12 border-t border-line pt-12" aria-labelledby="delete-title">
        <h2 id="delete-title" className="mb-4">
          Delete category
        </h2>
        <p className="mb-6 max-w-prose text-sm text-muted">
          A category can only be deleted once it has no products.
        </p>
        <ConfirmDeleteButton
          action={removeCategory}
          id={category.id}
          label="Delete category"
          warning={`Delete ${category.name}?`}
        />
      </section>
    </>
  );
}
