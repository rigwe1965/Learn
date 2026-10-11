// Static placeholder data for the storefront. Replace with database queries later.

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

export const featuredProducts: Product[] = [
  {
    id: "p1",
    slug: "leather-biker-jacket",
    description: "A fitted biker jacket in supple lambskin, finished with an asymmetric zip and tonal hardware. Softens with wear.",
    details: ["100% lambskin leather","Cotton-twill lining","Asymmetric front zip","Made in Portugal"],
    stock: 8,
    name: "Leather Biker Jacket",
    category: "Outerwear",
    price: 1450,
    image: img("1551028719-00167b16eac5", 800),
    alt: "Black leather jacket on a white surface",
    badge: "New",
  },
  {
    id: "p2",
    slug: "chain-shoulder-bag",
    description: "A compact flap bag in smooth calfskin with a removable chain strap that can be worn long or doubled.",
    details: ["Smooth calfskin","Magnetic flap closure","Removable chain strap","H 15 cm / W 22 cm / D 6 cm"],
    stock: 3,
    name: "Chain Shoulder Bag",
    category: "Bags",
    price: 890,
    image: img("1566150905458-1bf1fc113f0d", 800),
    alt: "Pink shoulder bag with a chain strap",
  },
  {
    id: "p3",
    slug: "satin-bomber",
    description: "A lightweight bomber in washed satin with a ribbed collar and cuffs. Easy over knitwear or a shirt.",
    details: ["Recycled satin","Ribbed collar, cuffs and hem","Zip front, two pockets","Machine washable at 30°C"],
    stock: 12,
    name: "Satin Bomber",
    category: "Outerwear",
    price: 620,
    image: img("1591047139829-d91aecb6caea", 800),
    alt: "Rust-coloured bomber jacket on a hanger",
  },
  {
    id: "p4",
    slug: "suede-brogue",
    description: "A classic brogue reworked in soft suede, with a flexible leather sole and hand-punched detailing.",
    details: ["Suede upper","Leather sole","Lace-up fastening","Made in Italy"],
    stock: 0,
    name: "Suede Brogue",
    category: "Shoes",
    price: 540,
    image: img("1560343090-f0409e92791a", 800),
    alt: "Green suede brogue shoe",
    badge: "New",
  },
  {
    id: "p5",
    slug: "poppy-wrap-dress",
    description: "A full-skirted wrap dress in a printed cotton blend, with a defined waist and a self-tie belt.",
    details: ["Cotton-blend poplin","Fully lined","Wrap front with belt","Hidden side pockets"],
    stock: 5,
    name: "Poppy Wrap Dress",
    category: "Dresses",
    price: 780,
    image: img("1572804013309-59a88b7e92f1", 800),
    alt: "Woman in a red floral dress",
  },
  {
    id: "p6",
    slug: "blossom-top-handle-bag",
    description: "A structured top-handle bag in a painterly floral print, with a roomy interior and a detachable strap.",
    details: ["Printed coated canvas","Leather trim","Detachable shoulder strap","H 24 cm / W 30 cm / D 14 cm"],
    stock: 2,
    name: "Blossom Top-Handle Bag",
    category: "Bags",
    price: 1120,
    image: img("1591561954557-26941169b49e", 800),
    alt: "Floral printed handbag",
  },
  {
    id: "p7",
    slug: "garden-print-dress",
    description: "A fluid wrap dress in a soft garden print. Cut for movement, with a flattering side tie.",
    details: ["Viscose crêpe","V-neck with side tie","Mid-length hem","Dry clean only"],
    stock: 9,
    name: "Garden Print Dress",
    category: "Dresses",
    price: 690,
    image: img("1496747611176-843222e1e57c", 800),
    alt: "Woman in a floral wrap dress by the sea",
  },
  {
    id: "p8",
    slug: "everyday-backpack",
    description: "A clean-lined backpack in water-resistant nylon with a padded laptop sleeve and adjustable straps.",
    details: ["Water-resistant nylon","Padded 15-inch laptop sleeve","Internal zip pocket","H 44 cm / W 30 cm / D 14 cm"],
    stock: 20,
    name: "Everyday Backpack",
    category: "Bags",
    price: 430,
    image: img("1553062407-98eeb64c6a62", 800),
    alt: "Navy backpack on a light floor",
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

export const getProductBySlug = (slug: string) =>
  featuredProducts.find((p) => p.slug === slug);

export const getRelatedProducts = (product: Product, count = 4) => {
  const others = featuredProducts.filter((p) => p.id !== product.id);
  const sameCategory = others.filter((p) => p.category === product.category);
  const rest = others.filter((p) => p.category !== product.category);
  return [...sameCategory, ...rest].slice(0, count);
};
