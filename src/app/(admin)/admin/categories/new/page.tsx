import type { Metadata } from "next";
import { CategoryForm } from "@/components/category-form";

export const metadata: Metadata = { title: "New category" };

export default function NewCategoryPage() {
  return (
    <section aria-labelledby="new-category-title">
      <h1 id="new-category-title" className="mb-8 md:mb-12">
        New category
      </h1>
      <CategoryForm />
    </section>
  );
}
