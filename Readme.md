# Handphone Ecommerce Monorepo

Full-stack ecommerce application with a Next.js frontend and an Express/MongoDB backend.

This repository contains:
- `client`: Next.js 15 customer + admin web app
- `server`: Express 5 API for auth, products, cart, orders, analytics, and admin dashboards

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Features](#features)
5. [Prerequisites](#prerequisites)
6. [Environment Variables](#environment-variables)
7. [Installation](#installation)
8. [Run the Project Locally](#run-the-project-locally)
9. [Available Scripts](#available-scripts)
10. [API Overview](#api-overview)
11. [Authentication and Security](#authentication-and-security)
12. [Data Models](#data-models)
13. [Checkout and Payments](#checkout-and-payments)
14. [Deployment Notes](#deployment-notes)
15. [CapRover Deployment (Server Only)](#caprover-deployment-server-only)
16. [Known Implementation Notes](#known-implementation-notes)
17. [Contributing](#contributing)

## Overview

Handphone is a full ecommerce platform with:
- Customer storefront: browse products, search/filter, cart, checkout, orders, profile
- Admin area: product management, customer management, orders, and analytics dashboards
- Backend APIs: authentication, product catalog, inventory-aware ordering, cart, analytics

The backend uses cookie-based auth and integrates Stripe + simulated mobile payments.

## Tech Stack

### Frontend (`client`)
- Next.js 15 (App Router)
- React 19
- Tailwind CSS
- Zustand (state management)
- Axios
- Stripe JS (`@stripe/stripe-js`, `@stripe/react-stripe-js`)
- Recharts, Framer Motion, Lucide icons

### Backend (`server`)
- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication
- Stripe server SDK
- Cloudinary (media upload)
- Security middleware: helmet, rate limiting, cookie parser, CORS

## Repository Structure

```text
Handphone/
|-- client/
|   |-- src/
|   |   |-- app/                # Next.js pages (customer + admin)
|   |   |-- components/         # Shared UI components
|   |   `-- Store/              # Zustand stores + Axios instance
|   `-- package.json
|
|-- server/
|   |-- controllers/            # Route handler logic
|   |-- middlewares/            # Auth middleware
|   |-- models/                 # Mongoose models
|   |-- routes/                 # Express routes
|   |-- services/               # Auth + Cloudinary services
|   |-- index.js                # API entry point
|   `-- package.json
|
`-- Readme.md                   # This file
```

## Features

### Customer Features
- Sign up, login, logout, session check
- Product listing and filtering
- Product details by ID/SKU/category/search
- Cart operations (add/update/remove/clear/count)
- Checkout flows (Stripe + mobile payment style flows)
- Order history, order detail view, order cancellation

### Admin Features
- Dashboard statistics and charts
- Product creation and product updates
- Customer listing/search/stats/update/delete
- Admin order management and order status updates
- Analytics endpoints for revenue trends and top products

### Backend/Platform Features
- JWT-based cookie authentication middleware
- MongoDB persistence for users, products, carts, and orders
- Stock validation before order creation
- Stripe webhook endpoint support
- Security headers and API rate limiting

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+
- MongoDB instance (Atlas or local)
- Stripe account (for checkout)
- Cloudinary account (for product/profile media uploads)

## Environment Variables

Each app has its own env file.

### Server (`server/.env`)

```bash
cd server
cp .env.example .env
```

```env
Mongo_Url=mongodb+srv://<username>:<password>@<cluster>/<db>
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
STRIPE_REDIRECT_BASE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client (`client/.env.local`)

```bash
cd client
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
NEXT_PUBLIC_API_URL=http://localhost:5001/product
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

Notes:
- In production, set `NEXT_PUBLIC_API_BASE_URL` to your deployed server URL (e.g. `https://api.your-domain.com`).
- Set server `FRONTEND_URL` to your deployed client URL (e.g. `https://your-app.vercel.app`) for CORS and Stripe redirects.
- Keep secrets out of source control.

## Installation

Install each app in its own folder:

```bash
cd server && npm install
cd ../client && npm install
```

## Run the Project Locally

Run backend and frontend in **separate terminals**.

### Terminal 1 — Backend API

```bash
cd server
cp .env.example .env   # first time only
npm run dev
```

Server: `http://localhost:5001`

### Terminal 2 — Frontend

```bash
cd client
cp .env.example .env.local   # first time only
npm run dev
```

Client: `http://localhost:3000`

## Available Scripts

### Client (`client/`)
- `npm run dev` — Next.js dev server (port 3000)
- `npm run build` — production build
- `npm run start` — production Next.js server

### Server (`server/`)
- `npm run dev` — start API with Node
- `npm start` — start API in production mode

## API Overview

Base URL (local): `http://localhost:5001`

### User routes (`/user`)
- `POST /user/sign-up`
- `POST /user/login`
- `GET /user/logout`
- `GET /user/check` (protected)
- `POST /user/update` (protected)
- `GET /user/getusers` (protected)
- `POST /user/admin-register`
- `GET /user/customers` (protected)
- `GET /user/customers/stats` (protected)
- `GET /user/customers/search` (protected)
- `GET /user/customers/:customerId` (protected)
- `PUT /user/customers/:customerId` (protected)
- `DELETE /user/customers/:customerId` (protected)
- `POST /user/customers/:customerId/email` (protected)

### Product routes (`/product`)
- `POST /product/addproduct` (protected)
- `GET /product/getallproducts`
- `GET /product/stats`
- `GET /product/featured`
- `GET /product/trending`
- `GET /product/new`
- `GET /product/hot`
- `GET /product/search`
- `GET /product/category/:category`
- `GET /product/sku/:sku`
- `GET /product/:productId`
- `PUT /product/:productId` (protected)
- `DELETE /product/:productId` (protected)

### Order routes (`/api`)
- `POST /api/create-stripe-checkout` (protected)
- `POST /api/stripe-success` (protected)
- `POST /api/confirm-payment` (protected)
- `POST /api/create-with-mobile-payment` (protected)
- `GET /api/my-orders` (protected)
- `GET /api/:orderId` (protected)
- `PATCH /api/:orderId/cancel` (protected)
- `POST /api/webhook/stripe` (Stripe webhook)
- `GET /api/admin/orders` (protected)
- `GET /api/admin/orders/:orderId` (protected)
- `PATCH /api/admin/orders/:orderId/status` (protected)
- `PATCH /api/admin/orders/:orderId/customer` (protected)
- `GET /api/admin/orders/stats/dashboard` (protected)

### Cart routes (`/api/cart`)
- `GET /api/cart/get-cart` (protected)
- `POST /api/cart/add` (protected)
- `PUT /api/cart/update/:itemId` (protected)
- `DELETE /api/cart/remove/:itemId` (protected)
- `DELETE /api/cart/clear` (protected)
- `GET /api/cart/count` (protected)

### Analytics routes (`/api/analytics`)
- `GET /api/analytics/dashboard` (protected)
- `GET /api/analytics/revenue-trends` (protected)
- `GET /api/analytics/top-products` (protected)
- `GET /api/analytics/categories` (protected)
- `GET /api/analytics/customers` (protected)
- `POST /api/analytics/track`

### Admin dashboard routes (`/api/admin`)
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/dashboard/revenue-chart`
- `GET /api/admin/dashboard/recent-orders`
- `GET /api/admin/dashboard/top-products`

## Authentication and Security

- Auth uses JWT in an HTTP-only cookie named `token`.
- Frontend requests are sent with `withCredentials: true`.
- Protected routes are guarded by `checkauth` middleware.
- Enabled security middleware includes:
	- `helmet`
	- `express-rate-limit` on `/api/*`
	- `cookie-parser`
	- `cors` with credentials

## Data Models

Main collections:
- `User`: profile, role (`admin`/`customer`), lifecycle status/segment, spend metrics
- `Product`: category, price, stock, tags, flags (`isFeatured`, `isTrending`, etc.)
- `Cart`: one cart per user, denormalized line items + totals
- `Order`: line items, billing info, payment details, lifecycle status, history
- `Analytics`: event tracking records (page/product/cart/checkout/purchase)

## Checkout and Payments

Supported order/payment patterns:
- Stripe Checkout session creation (`/api/create-stripe-checkout`)
- Stripe success confirmation (`/api/stripe-success`)
- Payment intent confirmation flow (`/api/confirm-payment`)
- Mobile payment simulation (`/api/create-with-mobile-payment`)
- Stripe webhook handling (`/api/webhook/stripe`)

## Deployment Notes

Deploy **client** and **server** separately.

| App | Suggested platform | Config |
|---|---|---|
| `client` | Vercel | Root Directory = `client`, env from `client/.env.example` |
| `server` | CapRover, Railway, Render | env from `server/.env.example` |

Before production:
- Set `NEXT_PUBLIC_API_BASE_URL` on the client to your live server URL.
- Set `FRONTEND_URL` and `STRIPE_REDIRECT_BASE_URL` on the server to your live client URL.
- Stripe webhook: `https://your-server-domain/api/webhook/stripe`
- Use HTTPS in production for secure cookies.

## Vercel Deployment (Client)

Deploy only the Next.js frontend.

1. Import the repo in [Vercel](https://vercel.com).
2. Set **Root Directory** to **`client`**.
3. Set **Framework Preset** to **Next.js**.
4. Add environment variables from `client/.env.example`:

| Variable | Example |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-server.example.com` |
| `NEXT_PUBLIC_API_URL` | `https://your-server.example.com/product` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |

5. Deploy. The client will call your separately hosted API.

## CapRover Deployment (Server)

Deploy only the Express API.

- CapRover app definition: `server/captain-definition`
- GitHub workflow: `.github/workflows/caprover-server-deploy.yml`

### 1) Create CapRover app

- Create an app in CapRover for the backend API (example: `handphone-server`).
- In app settings, set **Container HTTP Port** to `5001` (or update your server/app settings accordingly).

### 2) Configure CapRover app environment variables

Set these inside your CapRover app:
- `Mongo_Url`
- `NODE_ENV=production`
- `PORT=5001`
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 3) Add GitHub repository secrets

In GitHub repository settings, add:
- `CAPROVER_SERVER` (example: `https://captain.your-domain.com`)
- `CAPROVER_APP` (your CapRover app name)
- `CAPROVER_APP_TOKEN` (from CapRover app deployment tab)

### 4) Auto-deploy behavior

- The workflow deploys when files under `server/**` change.
- The workflow packages only the `server` folder into `deploy.tar`.

## Known Implementation Notes

Current codebase behavior to be aware of:
- JWT signing key is currently hardcoded in server auth service.
- Some URLs are still hardcoded for deployed environments instead of fully env-driven config.
- Server has no dedicated development script (`nodemon`) in `scripts`.
- Some admin routes are protected by auth but do not enforce role checks in route handlers.
- `POST /api/analytics/track` route logic expects an analytics model in routes; verify model import wiring before production.

## Contributing

1. Create a feature branch.
2. Keep changes scoped and documented.
3. Open a pull request with a clear summary and test notes.

---

If you want, this README can be extended further with:
- API request/response examples for each endpoint
- `.env.example` files for both apps
- local Docker setup for one-command startup
