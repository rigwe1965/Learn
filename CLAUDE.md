@AGENTS.md

# Atelier Nord — luxury-editorial storefront

Next.js 16.4 (App Router, Turbopack), React 19.3, Tailwind v4, Drizzle + Neon Postgres, Better Auth. Uses `pnpm` scripts (lockfile is `package-lock.json`; keep it in sync).

## Commands

- `pnpm dev` / `build` / `lint`
- `pnpm db:generate | db:migrate | db:seed | db:studio` (drizzle-kit reads `.env.local`; see `.env.example`)

## Next.js rules (breaking-change version)

- Read `node_modules/next/dist/docs/` before writing Next code.
- `cacheComponents` and `partialPrefetching` are on. Reading `params`/`searchParams`/cookies/headers or uncached I/O outside `<Suspense>` triggers an "Instant" dev-overlay warning.
- Fix by pushing the `await params` into a child component wrapped in `<Suspense>` (see `src/app/products/[slug]/page.tsx`), or `'use cache'` for cacheable data. Don't use `export const instant = false` to silence it.
- Pages type props with the global `PageProps<"/route/[param]">`.

## Layout

- `src/app/` routes: `/` and `/products/[slug]`; auth handler at `api/auth/[...all]`.
- `src/components/` one component per file, kebab-case filenames, named exports.
- `src/data/catalog.ts` static content only (hero, nav, collections, footer), the `Product` type, `formatPrice`, `getStockState`.
- `src/lib/auth.ts` (server) and `auth-client.ts` (client). Import alias `@/*` → `src/*`.
- Remote images only from `images.unsplash.com` (`next.config.ts`); add new hosts there.

## Database (Drizzle + Neon)

- Tables: `categories`, `products`, `stock` (1:1 with products, own table because it changes most). No carts/orders/payments/reviews/wishlists/variants yet.
- Money is integer cents (`price_cents`); queries convert to dollars so components keep the `Product` shape.
- Read only through `src/db/queries.ts` (`"use cache"` + `cacheTag("products")`). After any write, call `updateTag("products")`.
- Schema changes: edit `src/db/schema.ts` → `pnpm db:generate` → review SQL in `drizzle/` → `pnpm db:migrate`. Never `db:push`. Commit the migrations.
- `src/db/seed.ts` is idempotent (upserts by slug); keep slugs stable since they're URLs. `generateStaticParams` needs a seeded DB at build.
- Better Auth tables, when added, go in a separate schema file re-exported from `schema.ts`.
- Local dev uses the Neon `production` branch (no separate dev branch): `pnpm db:migrate` and `pnpm db:seed` write to live data, so confirm before running them.
- `.env.local` (gitignored) is written by `neon link` / `neon config init` with `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `NEON_BRANCH`; the link state lives in the gitignored `.neon`. Project `Learn` (`mute-heart-72771152`). Don't run `neon deploy` unless asked.

## Design system (`src/app/globals.css`)

Monochrome, square corners (radius tokens are 0), hairline borders, small tracked uppercase labels, generous whitespace. Use the `@theme` tokens (`text-muted`, `bg-subtle`, `border-line`, `text-accent`, `container-page`, `label`, `section`) rather than raw colors or sizes. Fonts: Inter (sans), Cormorant (display).

## Workflow

- Save every prompt to `prompts/NNN-short-title.md` with the next number (see `prompts/README.md`).
- Don't commit `.env*` other than `.env.example`.
