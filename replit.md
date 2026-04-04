# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk (via `@clerk/express` server-side, `@clerk/react` client-side)

## Application: Vesta

A mobile-first wardrobe app at `/`. Users can upload, organize clothes and get smart outfit recommendations.

### Features
- Clerk authentication (sign-up / sign-in)
- Clothing item CRUD with image upload (base64 client-side)
- Smart outfit matching engine (rule-based scoring, 0-10 score + reason)
- Outfit generation (best full combo from wardrobe)
- Favorites (save outfit pairs)
- Dashboard with stats and recent items
- Mark items as unavailable (laundry mode)
- Dark mode support

### Pages
- `/` — Landing page / redirect to dashboard if signed in
- `/dashboard` — Stats + recent items
- `/wardrobe` — Clothing grid with search + filters
- `/wardrobe/upload` — Upload new clothing item
- `/wardrobe/:id` — Item details, edit, delete, laundry toggle
- `/outfits` — Outfit recommendations + Generate Outfit button
- `/favorites` — Saved outfit combinations
- `/profile` — User profile + wardrobe insights

### DB Schema
- `clothing_items` — per-user clothing records
- `favorite_outfits` — saved outfit pairs (topId + bottomId)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
