# ZERO CLOTHING

A premium black-and-white sportswear e-commerce platform built with Next.js, TypeScript, and React.

## Current stage

The repository currently contains the initial storefront foundation:
- Responsive ZERO CLOTHING landing page
- Arabic/English interface toggle with RTL/LTR layout handling
- Product collection filters and search
- Interactive client-side shopping bag preview
- Brand manifesto, benefits, and footer sections

**Important:** the product catalog and shopping bag are currently frontend demo data. Checkout, database persistence, admin authentication, inventory, delivery-area rates, and order tracking have not yet been implemented. The product imagery is temporary stock imagery and must be replaced with approved ZERO CLOTHING product photos.

The original logo file was not present in the repository when the initial scaffold was created. The wordmark in the header is a temporary text treatment, not a replacement for the official logo. Add the supplied master logo asset before production.

## Requirements

- Node.js 20 or later
- npm

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm start
```

## Planned next stages

1. Add the official ZERO CLOTHING logo and approved product photography.
2. Create the PostgreSQL schema and migrations.
3. Implement product/category/variation management.
4. Implement secure admin authentication and dashboard.
5. Implement server-validated cart and guest checkout with Cash on Delivery.
6. Add Egyptian governorates, delivery areas, and admin-configurable shipping rates.
7. Add unique order references and privacy-protected order tracking.
8. Add automated tests, production environment configuration, and deployment documentation.

Never commit production secrets to this repository.
