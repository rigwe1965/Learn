"use client";

import { useState } from "react";
import type { Product } from "@/data/catalog";
import { addToCart } from "@/lib/cart";

export function AddToBagButton({ product, soldOut }: { product: Product; soldOut: boolean }) {
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className="btn btn-block"
      disabled={soldOut}
      onClick={() => {
        addToCart(product);
        setAdded(true);
      }}
    >
      {soldOut ? "Sold out" : added ? "Added to bag" : "Add to bag"}
    </button>
  );
}
