import { getStockState, type StockState } from "@/data/catalog";

const dot: Record<StockState, string> = {
  "in-stock": "bg-accent",
  "low-stock": "bg-amber-600",
  "out-of-stock": "bg-danger",
};

export function stockLabel(stock: number) {
  const state = getStockState(stock);
  if (state === "out-of-stock") return "Sold out";
  if (state === "low-stock") return `Only ${stock} left`;
  return "In stock";
}

export function StockStatus({ stock }: { stock: number }) {
  const state = getStockState(stock);
  return (
    <p className="flex items-center gap-2 text-sm" role="status">
      <span className={`size-2 rounded-full ${dot[state]}`} aria-hidden />
      {stockLabel(stock)}
    </p>
  );
}
