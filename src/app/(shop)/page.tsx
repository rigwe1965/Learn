import { Suspense } from "react";
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
      <Suspense fallback={<div className="container-page section" aria-hidden />}>
        <FeaturedProducts />
      </Suspense>
      <EditorialBanner />
      <ServicesStrip />
    </main>
  );
}
