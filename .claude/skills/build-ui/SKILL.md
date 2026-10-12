---
name: build-ui
description: Build a new storefront page or component for Atelier Nord that matches the existing design system, Next.js 16 conventions and database layer. Use when asked to build a page, section or UI piece.
---

# Build UI

1. Read `CLAUDE.md` and the relevant guide in `node_modules/next/dist/docs/` first.
2. Look at the closest existing page (`src/app/page.tsx`, `src/app/products/page.tsx`, `src/app/products/[slug]/page.tsx`) and mirror its structure: breadcrumb, `<Suspense>` around async data, `container-page` sections.
3. Read data only through `src/db/queries.ts`. Add a new `"use cache"` query with `cacheTag("products")` if one is needed.
4. Use design tokens from `src/app/globals.css` (`text-muted`, `border-line`, `label`, `product-grid`, ...). No raw colors, no rounded corners.
5. One component per file, kebab-case filenames, named exports. Reuse `ProductCard`, `SectionHeading`, etc.
6. Save the prompt to `prompts/NNN-short-title.md` with the next number.
7. Run `pnpm lint` and `pnpm build` to verify.
