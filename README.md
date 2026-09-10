# Retail Store Analytics

A full-stack retail sales and inventory demo that connects store-level operations to a live regional view. Store Managers can sell products and manage their location; Regional Managers can compare and drill into every store in their region.

> This is fictional demo data. The project is not affiliated with Apple Inc.

## Problem statement

Large retailers need store teams to see accurate inventory at the point of sale while regional leaders need those same transactions rolled up immediately. This app demonstrates that business loop in one deployable Next.js application.

```text
Regional Manager
       ↓
Michigan Region
       ↓
Multiple Stores
       ↓
Store Manager → Inventory → Sale → Transaction
```

## Architecture

The App Router serves the React UI and route handlers. Prisma provides typed PostgreSQL access. Every dashboard metric is calculated from store inventory and transaction rows rather than duplicated regional totals.

```text
Browser → Next.js UI → Route Handlers → Prisma → PostgreSQL
                              ↓
                    Atomic sale transaction
```

## Technology stack

- Next.js 15, React 19, and TypeScript
- Tailwind CSS 4
- PostgreSQL and Prisma ORM
- Recharts and Lucide icons
- Vercel-ready standalone build

## Features

- Role-aware login and navigation
- Store Manager dashboard with live KPIs, trends, top products, low stock, and recent transactions
- Inventory search, stock status, and sale modal with calculated total
- Atomic inventory decrement and transaction creation with oversell protection
- Searchable, sortable transaction ledger
- Regional KPIs derived from transactions across four Michigan stores
- Sales-by-store and seven-day sales charts
- Store comparison and regional drill-down views
- Friendly API validation and responsive desktop/mobile layouts

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Store Manager | `store@demo.com` | `password123` |
| Regional Manager | `regional@demo.com` | `password123` |

Authentication uses a short-lived, HTTP-only demo session cookie. It is intentionally simple and should be replaced with a production identity provider before handling real data.

## Database schema

- `User`: identity, role, assigned store, and region
- `Store`: location, region, and manager metadata
- `Product`: catalog, SKU, category, and database-owned price
- `Inventory`: on-hand quantity for a unique store/product pair
- `Transaction`: immutable sale quantity, unit price, total, store, product, and timestamp

The composite `Inventory(storeId, productId)` key is unique.

## How sales work

`POST /api/sales` validates the signed-in Store Manager, store, product, and positive whole-number quantity. Inside a serializable Prisma database transaction it reads the database price, conditionally decrements inventory only when sufficient stock exists, creates the sales transaction, and returns the remaining units. Any failure rolls back both writes.

The conditional update also prevents two concurrent requests from both selling the same last units.

## How regional aggregation works

Regional results are never manually stored. The API selects all stores in the manager's region and aggregates their transaction amounts and counts. A newly completed store sale therefore appears in both the Store Manager and Regional Manager dashboards on the next request.

## Local setup

Requirements: Node.js 20+, npm, and Docker Desktop (or a compatible PostgreSQL server).

```bash
npm install
docker compose up -d
npm run db:push
npm run db:seed
```

No local `.env` file is required. The application and database scripts default to the development-only Docker connection:

```text
postgresql://retail_demo:retail_demo_password@localhost:5432/retail_analytics
```

For a hosted environment, set `DATABASE_URL` in the provider dashboard; it overrides the local default.

### Database migration and seed

For local prototyping:

```bash
npm run db:push
npm run db:seed
```

For a migration-based workflow:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

The seed creates 2 users, 4 stores, 8 products, inventory at every store, and 44 historical transactions.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), select a demo role, and sign in.

### Production build

```bash
npm run build
npm start
```

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/login` | Validate demo credentials and create session |
| GET | `/api/stores` | List stores in the current user's scope |
| GET | `/api/stores/:id` | Get an accessible store |
| GET | `/api/stores/:id/inventory` | Store inventory and product prices |
| GET | `/api/stores/:id/transactions` | Newest-first sales history |
| POST | `/api/sales` | Atomically complete a sale |
| GET | `/api/dashboard/store/:id` | Store dashboard aggregation |
| GET | `/api/dashboard/region/:region` | Regional dashboard aggregation |

## Vercel deployment

1. Import `anishv69/store-data` into Vercel.
2. Provision a managed PostgreSQL database (for example Neon, Supabase, or Vercel Marketplace Postgres).
3. Add `DATABASE_URL` in the Vercel project settings. No `.env` file is used.
4. Apply the schema and seed from a trusted development/CI environment.
5. Deploy. Vercel runs `npm run build`, which generates Prisma Client before the Next.js build.

For production releases, commit generated Prisma migrations and run `prisma migrate deploy` in a controlled deployment step.

## Future production architecture

This version is intentionally optimized for rapid prototyping and a clean Vercel deployment. A high-scale retail platform could evolve toward bounded services and event-driven analytics:

```text
React / Next.js
       |
API Gateway
       |
------------------------------------------------
| Store | Product | Inventory | Sales | Analytics |
                            |
                          Kafka
                            |
                     Event Consumers
                            |
                       PostgreSQL

Redis · Docker · Kubernetes · Spring Boot services · Cloud infrastructure
```

That architecture is deliberately outside this demo. The project does not implement Kafka, Redis, Kubernetes, Spring Boot, microservices, payment processing, OAuth/SSO, higher geographic management levels, or machine learning.
