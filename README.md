# ZERO CLOTHING

Premium performance-wear storefront built with Next.js, TypeScript, Prisma, and PostgreSQL. Brand direction: monochrome black/white, premium performance wear, Gen Z.

## Stack and features

- Next.js App Router, React, TypeScript
- PostgreSQL + Prisma
- Arabic / English storefront language switch
- Cash on delivery only; no customer account required
- Separate stock for every product size + color variant
- Server-validated checkout totals and shipping by governorate + city/area
- Order code generated at checkout and order lookup by code + checkout phone
- Admin session uses a signed HTTP-only cookie
- Admin order status management, catalog setup, product editing, image URL management, and per-variant stock editing

## Routes

- `/` — brand landing page
- `/shop` — catalog, variants, cart, and COD checkout
- `/track-order` — guest order tracking
- `/admin` — admin sign-in, orders, inventory overview, and shipping overview
- `/admin/setup` — create categories/products and add delivery rates
- `/admin/products` — edit product information, visibility, prices, image URLs, and individual size/color stock

## Environment

Copy `.env.example` to `.env.local` and set:

- `DATABASE_URL` — PostgreSQL connection string (use the pooled connection string for serverless deployment where available)
- `ADMIN_EMAIL` — admin sign-in email
- `ADMIN_PASSWORD` — strong admin password
- `AUTH_SECRET` — cryptographically random secret, at least 32 characters
- `NEXT_PUBLIC_SITE_URL` — optional canonical public store URL for product metadata
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — optional but recommended shared rate limiting across serverless instances

Never commit production credentials.

## Database setup

1. `npm install`
2. `npx prisma generate`
3. `npx prisma db push`
4. `npm run dev`

Configure the production environment variables in the hosting dashboard before using the live store. For production, configure Upstash Redis so login, coupon, and checkout rate limits are shared across serverless instances; without it, a per-instance in-memory fallback is used. Add the actual delivery price for each governorate and city/area through `/admin/setup`. City-specific rates take precedence over the governorate-wide `*` rate; shipping is unavailable when neither exists.

## Product images

The current admin editor accepts direct HTTP(S) image URLs, one per line. A persistent image-upload provider still needs to be configured before local file uploads can be offered in production.

## API routes

- `GET /api/products` — active product catalog
- `GET /api/products/[slug]` — one active product for its detail page
- `POST /api/orders` — server-side price, shipping, and stock validation; creates COD order and reserves inventory transactionally
- `POST /api/orders/track` — track with order code + phone
- `POST /api/admin/login` and `POST /api/admin/logout` — admin session
- `GET/POST/PATCH /api/admin/products` — list, create, and edit products and size/color variants
- `POST /api/admin/categories` — create categories
- `GET/POST /api/admin/shipping` — list/upsert delivery rates by governorate and city/area
- `GET/PATCH /api/admin/orders` — list orders and update order status

## Verification

GitHub Actions runs Prisma generation, ESLint, TypeScript checks, and `next build` for pull requests targeting `main` and pushes to `main`. Verify every check before merging or deploying.

## Database migration note

The current repository setup documents `prisma db push` for schema synchronization. Do not switch production to `prisma migrate deploy` until a complete baseline migration has been generated and reconciled with the live database's `_prisma_migrations` history. Creating a baseline blindly can fail or alter a live database.