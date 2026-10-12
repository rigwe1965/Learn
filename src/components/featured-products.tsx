import { getProducts } from "@/db/queries";
import { ProductCard } from "./product-card";
import { SectionHeading } from "./section-heading";

export async function FeaturedProducts() {
  const products = await getProducts();

  return (
    <section className="container-page section pt-0 lg:pt-0" aria-label="New arrivals">
      <SectionHeading title="New arrivals" linkLabel="View all" href="/new-arrivals" />
      <div className="product-grid border border-line">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
