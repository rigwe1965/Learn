import Image from "next/image";
import Link from "next/link";
import { collections } from "@/data/catalog";
import { SectionHeading } from "./section-heading";

export function CollectionGrid() {
  return (
    <section className="container-page section" aria-label="Shop by category">
      <SectionHeading title="Shop by category" />
      <ul className="grid grid-cols-2 gap-x-2 gap-y-8 md:gap-x-4 lg:grid-cols-4">
        {collections.map((c) => (
          <li key={c.slug}>
            <Link href={c.href} className="group block hover:no-underline">
              <div className="media-product">
                <Image
                  src={c.image}
                  alt={c.alt}
                  fill
                  sizes="(min-width: 1024px) 24vw, 48vw"
                  className="object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
                />
              </div>
              <p className="label mt-4">{c.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
