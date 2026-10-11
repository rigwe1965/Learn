import Link from "next/link";
import { BRAND, footerColumns } from "@/data/catalog";

async function Year() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4 md:py-20">
        <p className="display text-xl uppercase tracking-[0.3em]">{BRAND}</p>
        {footerColumns.map((col) => (
          <div key={col.title}>
            <h2 className="label !font-sans !text-2xs">{col.title}</h2>
            <ul className="mt-4 space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-muted hover:text-foreground">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="container-page label py-6 text-muted">
          © <Year /> {BRAND}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
