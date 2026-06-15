# Architecture

Single-repo, two services:

- `BE/` — Node.js + Express + TypeScript + MongoDB (Mongoose).
- `FE/` — Next.js 16 App Router + TypeScript + Tailwind CSS v4 + Redux Toolkit.

Each side runs independently and talks over `/api/*`.

---

## Backend (`BE/`)

### Layering

```
HTTP request
   |
   v
src/app.ts                  cors + helmet + cookieParser + JSON body
   |
   v
src/routes/index.ts         composition root (mounts each module router)
   |
   v
src/modules/<feature>/      per-domain folder
   *.routes.ts              wire URLs + validate + rate-limit + auth
   *.controller.ts          parse request, delegate, shape response
   *.service.ts             business logic (transactions, orchestration)
   *.repository.ts          data access (mongoose / mongodb only)
   *.model.ts               mongoose schema(s) for this domain
   *.validation.ts          zod schemas + inferred Body/Params types
```

Cross-cutting concerns live in `src/middlewares/`:

- `auth.middleware.ts` — `requireAuth` (verifies access token).
- `validate.middleware.ts` — runs a zod schema on `body`/`query`/`params`.
- `rate-limit.middleware.ts` — `loginLimiter` (10/15m), `registerLimiter` (5/hour).
- `error.middleware.ts` — `notFoundHandler` + `errorHandler` with Mongo duplicate-key handling.

Other shared modules:

- `src/config/db.ts` — Mongoose connection.
- `src/utils/jwt.ts` — access + refresh helpers (`signAccessToken`, `signRefreshToken`, `verify*`). Two secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`).
- `src/utils/http-error.ts` — `httpError(message, status)` helper.

### Modules

| Module | URL prefix | Wired | Notes |
|---|---|---|---|
| `auth` | `/api/auth` | yes | register, login, refresh, logout, forgot/reset password. Rate-limited. |
| `cart` | `/api/cart` | yes | requireAuth. Service + repository pattern is fully implemented here as the template. |
| `categories` | `/api/categories` | yes | read-only catalog. |
| `health` | `/api/health` | yes | uptime / liveness. |
| `products` | `/api/products` | yes | catalog + variant repository for cart price lookup. |
| `users` | `/api/users` | yes | `/me`. |
| `orders` | n/a | model only | reserved for future checkout flow. |

### Auth flow

1. Client calls `POST /api/auth/login` with credentials.
2. Server returns `{ token, user }` in JSON (access token, default 15m) **and** sets `refreshToken` as an httpOnly cookie scoped to `/api/auth` (default 7d).
3. Client stores the access token (via `writeAccessToken` in FE `http.ts`) and sends it as `Authorization: Bearer <token>`.
4. On any 401, the FE response interceptor calls `POST /api/auth/refresh` once. The BE reads the cookie, verifies it, and issues a fresh access token (rotating the cookie). Single-flight on the FE so concurrent 401s share one refresh.
5. `POST /api/auth/logout` clears the refresh cookie (204).
6. `POST /api/auth/forgot-password` creates a short-lived reset token for matching accounts and returns a generic success message. In non-production it also returns `resetToken`/`resetUrl` for local testing; production email delivery still needs a mail provider decision.
7. `POST /api/auth/reset-password` accepts `{ token, password }`, verifies the stored reset-token hash + expiry, updates the password hash, and clears the reset token fields.

### Cart pricing rule

`POST /api/cart/items` accepts only `{ sku, quantity }`. The price comes from `product_variants` (filtered by `isActive: true`) inside `cart.service.addCartItem`. Client-supplied prices are never trusted.

### Data layer

- MongoDB collection names (in order of size):
  `users`, `products`, `product_variants`, `categories`, `colors`, `sizes`, `inventory`, `carts`, `wishlists`, `loyalty_tiers`, `orders`.
- Indexes are created by **migrate-mongo** files in `BE/migrations/`. Run with `npm run migrate:up` (config at `BE/migrate-mongo-config.ts`).
- Password reset support adds a sparse `users.passwordResetTokenHash` index via migration.
- Seed data lives at `BE/data/seed/*.ndjson` and is loaded with `npm run seed` (or `seed:reset` to wipe-then-insert).
- A reference mongodump backup is checked in at `BE/data/backup/e-commerce/` for emergencies.

### Tests

`npm test` runs Vitest. Current suite is unit-only (mocked repositories) and covers:

- `cart.service` (13 tests — all five service entry points)
- `jwt` access/refresh round-trips (6)
- `auth.validation` and `cart.validation` zod schemas (13)

---

## Frontend (`FE/`)

### Layering (feature-based)

```
FE/src/
  app/                Next.js App Router. Pages are thin RSC shells.
    products/page.tsx           dynamic-imported ProductList
    products/[slug]/page.tsx    reads params.slug, dynamic-imported ProductDetail
    wishlist/page.tsx
    account/page.tsx
    layout.tsx                  server-side nav fetch + theme bootstrap
  components/         layout/header/footer/cart-drawer, theme/, ui/ (shadcn), pages/
  features/
    auth/model/                 useAuth + auth.slice (in-memory)
    cart/model/                 useCart + cart.slice (persisted)
    wishlist/model/             useWishlist + wishlist.slice (persisted)
  store/                      configureStore, typed hooks, StoreProvider
  shared/
    hooks/                      useDebouncedValue
    types/                      Money
  utils/http.ts                 axios + access-token interceptor +
                                response 401 -> /auth/refresh -> retry
```

### Auth on the client

- Access token stored via `writeAccessToken` (localStorage today).
- Refresh token stays in an httpOnly cookie set by the BE.
- All cross-origin calls run with `withCredentials: true` so the cookie travels with refresh requests.
- The auth Redux slice is intentionally **not** persisted; `AuthSessionBootstrap` calls `/users/me` on reload, letting the response interceptor refresh the access token first when the refresh cookie is still valid.
- `/account/forgot-password` calls the forgot-password endpoint. `/account/reset-password?token=...` completes the password reset.

### State management policy

- **Persisted (`redux-persist`)**: `cart`, `wishlist` — same localStorage keys as before (`ecommerce-cart`, `ecommerce-wishlist`); shape differs from the old Zustand persist format, so existing carts may reset once after this migration.
- **Memory only**: `auth` (see above), `theme` (handled by `ThemeProvider`).
- **No global store** for product / category lists; they live on the page (server fetch) or in feature hooks.

### Tests

`npm test` runs Vitest under jsdom. Current suite:

- Cart store (6) and wishlist store (6) reducers
- `useCart` derived snapshot (3)
- `useDebouncedValue` (3)

---

## Common commands

```bash
# BE
cd BE
npm run dev               # nodemon + tsx
npm run typecheck
npm test
npm run migrate:up        # run pending index migrations
npm run seed              # load BE/data/seed/*.ndjson
npm run seed:reset        # wipe each target collection first

# FE
cd FE
npm run dev               # next dev
npm run typecheck
npm test
npm run lint
```

---

## Environment variables (BE)

| Var | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | Express listen port |
| `NODE_ENV` | `development` | Toggles error verbosity and cookie `secure` flag |
| `MONGODB_URL` | `mongodb://127.0.0.1:27017` | Base URL (no DB name) |
| `MONGODB_DATABASE` | `e-commerce` | Database name |
| `JWT_SECRET` | — (required) | Access-token secret |
| `JWT_REFRESH_SECRET` | falls back to `JWT_SECRET` | Refresh-token secret |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh cookie TTL |
| `CORS_ORIGIN` | `http://localhost:3000` | Comma-separated list, or `*` |
| `APP_ORIGIN` | falls back to first `CORS_ORIGIN` | Frontend origin used to build local/dev password reset links |

`FE` reads one env: `NEXT_PUBLIC_BASE_API` (used by `utils/http.ts` as axios `baseURL`).
