import Link from "next/link";

export function SectionHeading({
  title,
  linkLabel,
  href = "#",
}: {
  title: string;
  linkLabel?: string;
  href?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
      <h2>{title}</h2>
      {linkLabel && (
        <Link href={href} className="label link shrink-0">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
