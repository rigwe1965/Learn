import Image from "next/image";
import Link from "next/link";
import { editorial } from "@/data/catalog";

export function EditorialBanner() {
  return (
    <section className="grid md:grid-cols-2" aria-labelledby="editorial-title">
      <div className="media-hero !aspect-[4/5] md:!aspect-auto md:min-h-[42rem]">
        <Image
          src={editorial.image}
          alt={editorial.alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center bg-subtle px-6 py-16 md:px-16 lg:px-24">
        <p className="label text-muted">{editorial.eyebrow}</p>
        <h2 id="editorial-title" className="mt-4 !text-3xl md:!text-5xl">
          {editorial.title}
        </h2>
        <p className="mt-4 max-w-sm text-base">{editorial.copy}</p>
        <Link href={editorial.cta.href} className="btn btn-outline mt-8 self-start">
          {editorial.cta.label}
        </Link>
      </div>
    </section>
  );
}
