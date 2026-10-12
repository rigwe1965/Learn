// Input parsing for admin forms. Hand-rolled to avoid a new dependency; every
// parser returns either clean values or a map of field -> message.
export type FieldErrors = Record<string, string>;

// What every admin server action hands back to useActionState.
export type ActionState = {
  error?: string;
  fieldErrors?: FieldErrors;
  message?: string;
};

export type ProductInput = {
  name: string;
  slug: string;
  description: string;
  details: string[];
  priceCents: number;
  image: string;
  alt: string;
  badge: string | null;
  categoryId: number;
  quantity: number;
};

export type CategoryInput = { name: string; slug: string };

// Keep in step with images.remotePatterns in next.config.ts.
const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com"];

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

function parseWholeNumber(raw: string, max: number) {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n <= max ? n : null;
}

// "129" or "129.50" dollars -> cents, without floating point arithmetic.
export function dollarsToCents(raw: string) {
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(raw);
  if (!match) return null;
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0") || 0);
}

export function parseProduct(
  data: FormData,
  isNew: boolean,
): { values: ProductInput } | { errors: FieldErrors } {
  const errors: FieldErrors = {};

  const name = text(data, "name");
  if (!name) errors.name = "Enter a name.";

  let slug = text(data, "slug");
  if (isNew && !slug) slug = slugify(name);
  if (!SLUG_PATTERN.test(slug)) {
    errors.slug = "Use lowercase letters, numbers and single hyphens.";
  }

  const description = text(data, "description");
  if (!description) errors.description = "Enter a description.";

  const details = text(data, "details")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const priceCents = dollarsToCents(text(data, "price"));
  if (priceCents === null) errors.price = "Enter a price such as 129 or 129.50.";

  const image = text(data, "image");
  try {
    const url = new URL(image);
    if (url.protocol !== "https:" || !ALLOWED_IMAGE_HOSTS.includes(url.hostname)) {
      errors.image = `Images must be https URLs on ${ALLOWED_IMAGE_HOSTS.join(", ")}.`;
    }
  } catch {
    errors.image = "Enter a valid image URL.";
  }

  const alt = text(data, "alt");
  if (!alt) errors.alt = "Describe the image for screen readers.";

  const badge = text(data, "badge") || null;

  const categoryId = parseWholeNumber(text(data, "categoryId"), 2_147_483_647);
  if (!categoryId) errors.categoryId = "Choose a category.";

  const quantity = parseWholeNumber(text(data, "quantity"), 100_000);
  if (quantity === null) errors.quantity = "Enter a whole number from 0 to 100000.";

  if (Object.keys(errors).length > 0) return { errors };
  return {
    values: {
      name,
      slug,
      description,
      details,
      priceCents: priceCents!,
      image,
      alt,
      badge,
      categoryId: categoryId!,
      quantity: quantity!,
    },
  };
}

export function parseCategory(
  data: FormData,
  isNew: boolean,
): { values: CategoryInput } | { errors: FieldErrors } {
  const errors: FieldErrors = {};
  const name = text(data, "name");
  if (!name) errors.name = "Enter a name.";

  let slug = text(data, "slug");
  if (isNew && !slug) slug = slugify(name);
  if (!SLUG_PATTERN.test(slug)) {
    errors.slug = "Use lowercase letters, numbers and single hyphens.";
  }

  if (Object.keys(errors).length > 0) return { errors };
  return { values: { name, slug } };
}

export function parseId(raw: FormDataEntryValue | null) {
  return parseWholeNumber(String(raw ?? ""), 2_147_483_647);
}

export function parseStockChange(
  data: FormData,
): { mode: "set" | "adjust"; amount: number } | { error: string } {
  const mode = text(data, "mode");
  const raw = text(data, "amount");
  if (mode === "set") {
    const amount = parseWholeNumber(raw, 100_000);
    return amount === null
      ? { error: "Enter a whole number from 0 to 100000." }
      : { mode, amount };
  }
  if (mode === "adjust") {
    const match = /^([+-]?)(\d{1,6})$/.exec(raw);
    if (!match || Number(match[2]) === 0) {
      return { error: "Enter a change such as 5 or -3." };
    }
    return { mode, amount: Number(match[2]) * (match[1] === "-" ? -1 : 1) };
  }
  return { error: "Choose how to change the stock." };
}
