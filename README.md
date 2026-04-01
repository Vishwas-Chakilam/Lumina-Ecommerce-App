# Lumina – E‑commerce App

Full‑stack demo e‑commerce application built with:

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Spring Boot 4, Java 21, Spring Data JPA
- **Auth & DB**: Supabase (Auth + Postgres)
----
## Features

- Product catalog with categories, search, featured section
- Product detail pages with quantity selection and add‑to‑cart
- Cart, checkout, and payment steps (UPI / COD / Card UI)
- Order creation with order history and order tracking
- User profile with saved addresses
- Wishlist
- Admin dashboard for products and orders (in progress)
- Toast notifications and polished login/sign‑up UI

## Project structure

```text
Lumina/
  Backend (SpringBoot)/Ecom/   # Spring Boot backend
  Frontend/                    # React + Vite frontend
```

## Backend – Spring Boot + Supabase

### Requirements

- Java 21
- Maven (or the included `mvnw` wrapper)

### Environment variables

Configure these for **local dev** (via IDE run configuration or PowerShell) before running the backend:

```bash
SUPABASE_URL=<your-supabase-url>                # e.g. https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=<your-supabase-service-key>

SUPABASE_DB_URL=jdbc:postgresql://<host>:5432/postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=<your-db-password>
```

These are read in `Backend (SpringBoot)/Ecom/src/main/resources/application.yml` and **must not** be committed.

### Run backend (from repository root)

```bash
cd "Backend (SpringBoot)/Ecom"
.\mvnw.cmd spring-boot:run
```

The backend will start on `http://localhost:8080` and exposes REST APIs under `/api/...` (products, cart, wishlist, profile, orders, auth).

## Frontend – React + Vite

### Requirements

- Node.js 18+

### Setup & run

```bash
cd Frontend
npm install
npm run dev
```

By default Vite runs on `http://localhost:5173`.

### Frontend env

Create `Frontend/.env` (not committed) with:

```env
VITE_API_BASE_URL=http://localhost:8080
```

The frontend uses this base URL to talk to the Spring Boot backend for:

- Products (`/api/products`)
- Cart (`/api/cart/...`)
- Wishlist (`/api/wishlist/...`)
- Profile & addresses (`/api/profile/...`)
- Orders (`/api/orders/...`)
- Auth (`/api/auth/signup`, `/api/auth/login`)

## Auth flow

- Frontend sign‑up / login calls the backend `/api/auth/...` endpoints.
- Backend uses Supabase Auth (via service key) to create and authenticate users.
- The returned Supabase `user.id` is used as the `userId` for all cart/orders/profile data in Postgres.

## Notes

- `.env` files and other secrets are ignored via `.gitignore`.
- For production, you should rotate the example keys/passwords you used in local dev and configure them via your deployment environment.

