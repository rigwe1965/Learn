import { featuredProducts } from "@/data/catalog";
import { ProductCard } from "./product-card";
import { SectionHeading } from "./section-heading";

export function FeaturedProducts() {
  return (
    <section className="container-page section pt-0 lg:pt-0" aria-label="New arrivals">
      <SectionHeading title="New arrivals" linkLabel="View all" />
      <div className="product-grid border border-line">
        {featuredProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
