"use client";

import Link from "next/link";
import { saveProduct } from "@/app/(admin)/admin/actions";
import type { AdminProduct } from "@/db/admin-queries";
import { useAdminAction } from "@/lib/use-admin-action";
import { AdminField } from "./admin-field";

export function ProductForm({
  product,
  categories,
}: {
  product?: AdminProduct;
  categories: { id: number; name: string }[];
}) {
  const { state, pending, onSubmit } = useAdminAction(saveProduct);
  const err = state.fieldErrors ?? {};
  const editing = Boolean(product);

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-2xl" aria-label={editing ? "Edit product" : "New product"}>
      {product && <input type="hidden" name="id" value={product.id} />}

      <AdminField id="name" label="Name" error={err.name}>
        <input id="name" name="name" defaultValue={product?.name} required aria-describedby="name-error" />
      </AdminField>

      <AdminField
        id="slug"
        label="Slug"
        error={err.slug}
        hint={
          editing
            ? "Part of the product's URL. Changing it breaks existing links."
            : "Part of the product's URL. Leave blank to use the name."
        }
      >
        <input id="slug" name="slug" defaultValue={product?.slug} aria-describedby="slug-error" />
      </AdminField>

      <AdminField id="categoryId" label="Category" error={err.categoryId}>
        <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""} required>
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </AdminField>

      <div className="grid gap-x-6 sm:grid-cols-2">
        <AdminField id="price" label="Price (USD)" error={err.price}>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            defaultValue={product ? (product.priceCents / 100).toFixed(2) : ""}
            required
          />
        </AdminField>
        <AdminField id="quantity" label="Stock" error={err.quantity}>
          <input
            id="quantity"
            name="quantity"
            inputMode="numeric"
            defaultValue={product?.stock ?? 0}
            required
          />
        </AdminField>
      </div>

      <AdminField id="description" label="Description" error={err.description}>
        <textarea id="description" name="description" rows={4} defaultValue={product?.description} required />
      </AdminField>

      <AdminField id="details" label="Details" hint="One detail per line." error={err.details}>
        <textarea id="details" name="details" rows={4} defaultValue={product?.details.join("\n")} />
      </AdminField>

      <AdminField id="image" label="Image URL" error={err.image}>
        <input id="image" name="image" type="url" defaultValue={product?.image} required />
      </AdminField>

      <AdminField id="alt" label="Image description" error={err.alt}>
        <input id="alt" name="alt" defaultValue={product?.alt} required />
      </AdminField>

      <AdminField id="badge" label="Badge (optional)" error={err.badge}>
        <input id="badge" name="badge" defaultValue={product?.badge ?? ""} />
      </AdminField>

      <p role="alert" className="min-h-5 text-sm text-danger">
        {state.error}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Please wait…" : editing ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
