# Contributing

Read `ARCHITECTURE.md` first. Everything below assumes that layout.

---

## Local setup

```bash
git clone <repo>
cd e-commerce

# Backend
cd BE
cp .env.example .env        # fill in JWT_SECRET, JWT_REFRESH_SECRET
npm install
npm run migrate:up
npm run seed                # optional, loads sample data
npm run dev                 # http://localhost:3001

# Frontend (new terminal)
cd ../FE
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

`FE` and `BE` are **two separate npm projects**. The repo uses **npm** (not pnpm). Do not commit `pnpm-lock.yaml` or `yarn.lock`.

---

## Branch + commit policy

- Branch off `dev`. Never commit directly to `main` or `dev`.
- Use Conventional Commit-style prefixes: `feat(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, `chore(scope): ...`, `test(scope): ...`, `docs: ...`, `perf(scope): ...`. Scope is usually `be` or `fe` (or a module name like `be/cart`).
- Keep commits small and atomic. Each commit should leave both sides typechecking and the test suite green.

---

## Adding a new BE module

Pick a domain name (e.g. `wishlists`) and create `BE/src/modules/wishlists/`. Files:

```
wishlists.routes.ts         Express router. Compose with validate() + requireAuth.
wishlists.controller.ts     Request/response only. Delegates to service.
wishlists.service.ts        Business logic. Throws via httpError(...).
wishlists.repository.ts     Mongoose access only.
Wishlist.model.ts           Schema. Capitalised file name, "Wishlist" mongoose model.
wishlists.validation.ts     zod schemas. Export both schema and inferred Body type.
```

Wire it from `BE/src/routes/index.ts`:

```ts
import wishlistsRoutes from "@/modules/wishlists/wishlists.routes";
router.use("/wishlists", wishlistsRoutes);
```

Cart is the reference implementation. Match its structure.

If the module owns rows in MongoDB, add an index migration via `npm run migrate:create -- <name>` and check the result against `BE/data/seed/<collection>.ndjson` if the collection is seeded.

---

## Adding a new FE feature

Create `FE/src/features/<feature>/`. Minimum:

```
model/<feature>.types.ts       Public interfaces.
model/<feature>.store.ts       zustand store (persist only if data must survive reloads).
model/use<Feature>.ts          Hook on top of the store. Exposes a snapshot
                               + actions and computes any derived values.
index.ts                       Barrel: re-export hook + store + public types.
```

If the feature talks to the BE, add an `api/` folder with a thin wrapper around `@/utils/http` and consume it from the hook.

Where to put UI:

- Single-page UI lives in `FE/src/app/<route>/page.tsx`.
- Cross-page widgets (header, footer, cart drawer) live in `FE/src/components/layout/`.
- Heavy client components mounted from a single route should be split with `next/dynamic` (see `app/products/page.tsx`).

---

## Tests

Write a unit test next to the file it covers (`foo.ts` -> `foo.test.ts`).

- BE service tests mock the repository (`vi.mock("@/modules/<m>/<m>.repository")`).
- BE validation tests call `schema.parse(...)` directly.
- FE store tests reset the store in `beforeEach` with `useStore.setState({...})`.
- FE hook tests use `renderHook` from `@testing-library/react`.

Run:

```bash
# BE
cd BE && npm test

# FE
cd FE && npm test
```

Both sides must be green before opening a PR.

---

## Pre-PR checklist

```bash
# BE
cd BE
npm run typecheck
npm test

# FE
cd FE
npm run typecheck
npm test
npm run lint
```

Then open a PR into `dev`. Title follows the same conventional-commit format as your commits. Keep the PR scope tight; if you touched more than one phase of `ARCHITECTURE.md`, split it.
