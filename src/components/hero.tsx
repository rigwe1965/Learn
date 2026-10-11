import Image from "next/image";
import Link from "next/link";
import { hero } from "@/data/catalog";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative text-inverse">
      <div className="media-hero !aspect-[4/5] md:!aspect-[16/8] lg:max-h-[calc(100svh-var(--header-height))]">
        <Image
          src={hero.image}
          alt={hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_30%]"
        />
        <div className="absolute inset-0 bg-black/25" aria-hidden />
      </div>
      <div className="container-page absolute inset-x-0 bottom-0 pb-10 md:pb-16">
        <p className="label">{hero.eyebrow}</p>
        <h1 id="hero-title" className="mt-3 max-w-2xl">
          {hero.title}
        </h1>
        <p className="mt-4 max-w-md text-base">{hero.copy}</p>
        <Link
          href={hero.cta.href}
          className="btn mt-8 !border-inverse !bg-inverse !text-foreground hover:!bg-transparent hover:!text-inverse"
        >
          {hero.cta.label}
        </Link>
      </div>
    </section>
  );
}
