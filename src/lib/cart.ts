"use client";

import { useSyncExternalStore } from "react";
import type { Product } from "@/data/catalog";

// Client-side cart kept in localStorage. There is no cart table or checkout yet.
export type CartItem = Pick<
  Product,
  "slug" | "name" | "category" | "price" | "image" | "alt" | "stock"
> & { quantity: number };

const KEY = "atelier-nord-cart";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : EMPTY;
    items = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  if (!loaded) load();
  return items;
}

const getServerSnapshot = () => EMPTY;

const clamp = (quantity: number, stock: number) => Math.max(0, Math.min(quantity, stock));

export function addToCart(product: Product, quantity = 1) {
  const current = getSnapshot();
  const { slug, name, category, price, image, alt, stock } = product;
  if (current.some((i) => i.slug === slug)) {
    commit(
      current.map((i) =>
        i.slug === slug ? { ...i, stock, quantity: clamp(i.quantity + quantity, stock) } : i,
      ),
    );
  } else {
    commit([
      ...current,
      { slug, name, category, price, image, alt, stock, quantity: clamp(quantity, stock) },
    ]);
  }
}

export function setQuantity(slug: string, quantity: number) {
  commit(
    getSnapshot()
      .map((i) => (i.slug === slug ? { ...i, quantity: clamp(quantity, i.stock) } : i))
      .filter((i) => i.quantity > 0),
  );
}

export function removeFromCart(slug: string) {
  commit(getSnapshot().filter((i) => i.slug !== slug));
}

export function useCart() {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    items: cart,
    count: cart.reduce((n, i) => n + i.quantity, 0),
    subtotal: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}
