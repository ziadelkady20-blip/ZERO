# ZERO CLOTHING

Premium performance-wear storefront built with Next.js, TypeScript, and Prisma.

## Stack
- Next.js App Router / React / TypeScript
- PostgreSQL + Prisma
- Cash on delivery only
- Arabic / English storefront
- Independent inventory for each size + color variant
- Order tracking by order code and phone
- Admin dashboard at `/admin`, protected by a signed HTTP-only session cookie

## Environment
Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and a random `AUTH_SECRET` of at least 32 characters. Never commit production credentials.

## Database setup
Run `npm install`, `npx prisma generate`, `npx prisma db push`, then `npm run dev`.

Create categories and shipping rates in the admin dashboard before publishing products and accepting orders.

## API routes
- `GET /api/products` — active catalog
- `POST /api/orders` — server-side price, shipping, and stock validation; creates COD order and reserves inventory
- `POST /api/orders/track` — track with order code + phone
- `POST /api/admin/login` and `POST /api/admin/logout` — admin session
- `GET/POST /api/admin/products` — list/create products
- `POST /api/admin/categories` — create categories
- `GET/POST /api/admin/shipping` — list/upsert delivery rates by governorate and city/area
- `GET/PATCH /api/admin/orders` — list orders and update status

The storefront checkout and catalog still need to be connected to these endpoints. Configure database and environment variables before expecting live data or accepting real orders.
