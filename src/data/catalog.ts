// Static storefront content. Products, categories and stock live in the database (see src/db/queries.ts).

export const BRAND = "Atelier Nord";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

export type Collection = {
  slug: string;
  title: string;
  href: string;
  image: string;
  alt: string;
};

export type Product = {
  id: string;
  slug: string;
  description: string;
  details: string[];
  stock: number;
  name: string;
  category: string;
  price: number;
  image: string;
  alt: string;
  badge?: string;
};

export const navLinks = [
  { label: "Women", href: "#" },
  { label: "Men", href: "#" },
  { label: "Bags", href: "#" },
  { label: "Shoes", href: "#" },
  { label: "Accessories", href: "#" },
];

export const hero = {
  eyebrow: "Autumn / Winter",
  title: "The Quiet Coat",
  copy: "Considered outerwear, cut with restraint and made to last beyond the season.",
  cta: { label: "Discover the collection", href: "#" },
  image: img("1539109136881-3be0616acf4b", 2000),
  alt: "Woman in a long pale blue coat in a cathedral square",
};

export const collections: Collection[] = [
  {
    slug: "women",
    title: "Women",
    href: "#",
    image: img("1585487000160-6ebcfceb0d03"),
    alt: "Woman in a burgundy dress",
  },
  {
    slug: "men",
    title: "Men",
    href: "#",
    image: img("1594938298603-c8148c4dae35"),
    alt: "Man in a blue checked suit",
  },
  {
    slug: "bags",
    title: "Bags",
    href: "#",
    image: img("1584917865442-de89df76afd3"),
    alt: "Red structured handbag",
  },
  {
    slug: "accessories",
    title: "Accessories",
    href: "#",
    image: img("1523275335684-37898b6baf30"),
    alt: "White minimalist watch",
  },
];

export const editorial = {
  eyebrow: "Spring Preview",
  title: "Colour, Unfiltered",
  copy: "Saturated tones and easy shapes for the season ahead.",
  cta: { label: "Explore the edit", href: "#" },
  image: img("1515886657613-9f3515b0c78f", 1800),
  alt: "Woman in a mustard tracksuit on a beach court",
};

export const services = [
  { title: "Complimentary shipping", copy: "On all orders over $250." },
  { title: "Free returns", copy: "Within 30 days of delivery." },
  { title: "Gift packaging", copy: "Wrapped by hand on request." },
];

export const footerColumns = [
  {
    title: "Customer care",
    links: ["Contact us", "Shipping", "Returns", "Size guide"],
  },
  {
    title: "The house",
    links: ["Our story", "Sustainability", "Careers", "Press"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Cookies"],
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const LOW_STOCK_THRESHOLD = 5;

export type StockState = "in-stock" | "low-stock" | "out-of-stock";

export function getStockState(stock: number): StockState {
  if (stock <= 0) return "out-of-stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}
