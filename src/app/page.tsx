import { CollectionGrid } from "@/components/collection-grid";
import { EditorialBanner } from "@/components/editorial-banner";
import { FeaturedProducts } from "@/components/featured-products";
import { Hero } from "@/components/hero";
import { ServicesStrip } from "@/components/services-strip";

export default function Home() {
  return (
    <main>
      <Hero />
      <CollectionGrid />
      <FeaturedProducts />
      <EditorialBanner />
      <ServicesStrip />
    </main>
  );
}
