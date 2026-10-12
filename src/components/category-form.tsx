"use client";

import Link from "next/link";
import { saveCategory } from "@/app/(admin)/admin/actions";
import { useAdminAction } from "@/lib/use-admin-action";
import { AdminField } from "./admin-field";

export function CategoryForm({ category }: { category?: { id: number; name: string; slug: string } }) {
  const { state, pending, onSubmit } = useAdminAction(saveCategory);
  const err = state.fieldErrors ?? {};
  const editing = Boolean(category);

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md" aria-label={editing ? "Edit category" : "New category"}>
      {category && <input type="hidden" name="id" value={category.id} />}

      <AdminField id="name" label="Name" error={err.name}>
        <input id="name" name="name" defaultValue={category?.name} required />
      </AdminField>

      <AdminField
        id="slug"
        label="Slug"
        error={err.slug}
        hint={
          editing
            ? "Part of the category's URL. Changing it breaks existing links."
            : "Part of the category's URL. Leave blank to use the name."
        }
      >
        <input id="slug" name="slug" defaultValue={category?.slug} />
      </AdminField>

      <p role="alert" className="min-h-5 text-sm text-danger">
        {state.error}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Please wait…" : editing ? "Save changes" : "Create category"}
        </button>
        <Link href="/admin/categories" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
