"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  adjustStock,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  setStock,
  updateCategory,
  updateProduct,
} from "@/db/mutations";
import { requireAdmin } from "@/lib/admin";
import {
  type ActionState,
  parseCategory,
  parseId,
  parseProduct,
  parseStockChange,
} from "@/lib/admin-validation";

// Server actions are public POST endpoints: every one starts with requireAdmin().

const refreshStore = () => updateTag("products");

export async function saveProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = formData.get("id") ? parseId(formData.get("id")) : null;
  if (formData.get("id") && !id) return { error: "Product not found." };

  const parsed = parseProduct(formData, id === null);
  if ("errors" in parsed) return { fieldErrors: parsed.errors };

  const result = id
    ? await updateProduct(id, parsed.values)
    : await createProduct(parsed.values);
  if (!result.ok) {
    return result.field ? { fieldErrors: { [result.field]: result.error } } : { error: result.error };
  }
  refreshStore();
  redirect("/admin/products");
}

export async function removeProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = parseId(formData.get("id"));
  if (!id) return { error: "Product not found." };
  const result = await deleteProduct(id);
  if (!result.ok) return { error: result.error };
  refreshStore();
  redirect("/admin/products");
}

export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = formData.get("id") ? parseId(formData.get("id")) : null;
  if (formData.get("id") && !id) return { error: "Category not found." };

  const parsed = parseCategory(formData, id === null);
  if ("errors" in parsed) return { fieldErrors: parsed.errors };

  const result = id
    ? await updateCategory(id, parsed.values)
    : await createCategory(parsed.values);
  if (!result.ok) {
    return result.field ? { fieldErrors: { [result.field]: result.error } } : { error: result.error };
  }
  refreshStore();
  redirect("/admin/categories");
}

export async function removeCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = parseId(formData.get("id"));
  if (!id) return { error: "Category not found." };
  const result = await deleteCategory(id);
  if (!result.ok) return { error: result.error };
  refreshStore();
  redirect("/admin/categories");
}

export async function changeStock(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const productId = parseId(formData.get("id"));
  if (!productId) return { error: "Product not found." };

  const change = parseStockChange(formData);
  if ("error" in change) return { fieldErrors: { amount: change.error } };

  if (change.mode === "set") {
    await setStock(productId, change.amount);
    refreshStore();
    return { message: `Stock set to ${change.amount}.` };
  }
  const result = await adjustStock(productId, change.amount);
  if (!result.ok) return { fieldErrors: { amount: result.error } };
  refreshStore();
  return { message: `Stock is now ${result.data.quantity}.` };
}
