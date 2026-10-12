// Hairline table that scrolls sideways on narrow screens instead of squeezing.
export function DataTable({
  caption,
  columns,
  children,
}: {
  caption: string;
  columns: { label: string; align?: "right" }[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto border-y border-line">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th
                key={c.label}
                scope="col"
                className={`label py-3 pr-4 font-medium text-muted ${c.align === "right" ? "text-right" : ""}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divider-y">{children}</tbody>
      </table>
    </div>
  );
}
