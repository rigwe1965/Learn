import { services } from "@/data/catalog";

export function ServicesStrip() {
  return (
    <section className="container-page section" aria-label="Services">
      <ul className="grid divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {services.map((s) => (
          <li key={s.title} className="px-2 py-8 text-center md:px-8 md:py-12">
            <h3 className="label !font-sans">{s.title}</h3>
            <p className="mt-2 text-muted">{s.copy}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
