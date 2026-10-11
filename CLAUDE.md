@AGENTS.md

# Atelier Nord — luxury-editorial storefront

Next.js 16.4 (App Router, Turbopack), React 19.3, Tailwind v4, Drizzle + Neon Postgres, Better Auth. Uses `pnpm` scripts (lockfile is `package-lock.json`; keep it in sync).

## Commands
- `pnpm dev` / `build` / `lint`
- `pnpm db:generate | db:migrate | db:push | db:studio` (drizzle-kit reads `.env.local`; see `.env.example`)

## Next.js rules (breaking-change version)
- Read `node_modules/next/dist/docs/` before writing Next code.
- `cacheComponents` and `partialPrefetching` are on. Reading `params`/`searchParams`/cookies/headers or uncached I/O outside `<Suspense>` triggers an "Instant" dev-overlay warning.
- Fix by pushing the `await params` into a child component wrapped in `<Suspense>` (see `src/app/products/[slug]/page.tsx`), or `'use cache'` for cacheable data. Don't use `export const instant = false` to silence it.
- Pages type props with the global `PageProps<"/route/[param]">`.

## Layout
- `src/app/` routes: `/` and `/products/[slug]`; auth handler at `api/auth/[...all]`.
- `src/components/` one component per file, kebab-case filenames, named exports.
- `src/data/catalog.ts` static placeholder catalog and helpers (`getProductBySlug`, `getRelatedProducts`, `formatPrice`, `getStockState`). Swap for `src/db` queries later; `src/db/schema.ts` is still empty.
- `src/lib/auth.ts` (server) and `auth-client.ts` (client). Import alias `@/*` → `src/*`.
- Remote images only from `images.unsplash.com` (`next.config.ts`); add new hosts there.

## Design system (`src/app/globals.css`)
Monochrome, square corners (radius tokens are 0), hairline borders, small tracked uppercase labels, generous whitespace. Use the `@theme` tokens (`text-muted`, `bg-subtle`, `border-line`, `text-accent`, `container-page`, `label`, `section`) rather than raw colors or sizes. Fonts: Inter (sans), Cormorant (display).

## Workflow
- Save every prompt to `prompts/NNN-short-title.md` with the next number (see `prompts/README.md`).
- Don't commit `.env*` other than `.env.example`.
