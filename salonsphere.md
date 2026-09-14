# SalonSphere — Project Context & Fix Log

> Living document. Created 2026-09-12 during a full-project audit.
> Keep this updated when architecture or conventions change.

## 1. What the project is

**SalonSphere** is a Next.js 15 (App Router) + MongoDB/Mongoose marketplace for salons:

| Area | Route prefix | Who uses it |
|---|---|---|
| Public storefront (salons, self-care products, cart, checkout) | `/`, `/salons`, `/selfcare-products`, `/cart`, `/checkout` | Customers |
| Customer auth | `/auth/*`, `/register`, `/verify-email` | Customers (NextAuth: credentials + Google) |
| Booking flow | `/Booking`, `/salons/[id]/book`, `/bookings` | Customers / guests |
| Salon owner onboarding | `/salon/register/*` (multi-step) | Salon admins |
| Salon dashboard | `/salon/dashboard/*` | Salon admins (NextAuth role `salon_admin`) |
| Super-admin dashboard | `/Superadmin/*` | Platform admin |
| REST API | `/api/*` (94 route files) | All of the above |

**Stack:** Next.js 15.5 · React 19 · TypeScript (strict) · Tailwind 3 + daisyUI + shadcn/radix · Mongoose 8 · NextAuth v4 (JWT) · Stripe · Cloudinary · Nodemailer · react-hook-form + zod · zustand (cart).

**Key directories**
```
src/app/            App Router pages + API routes
src/mongoose-models/ Single source of truth for Mongoose schemas (28 models)
src/lib/            authOptions, session helpers, email, cloudinary, utils
src/common/         Shared storefront components (navbar, footer, cart…)
src/store/          zustand cart store + context
src/dbConnect.ts    Cached Mongoose connection (use this everywhere)
types/              next-auth module augmentation + shared TS types
```

**Origin note:** Booking, Superadmin dashboard and Salon dashboard were exported from Lovable (Vite + react-router) and pasted into the Next.js tree. A lot of the issues below are leftovers from that.

---

## 2. Audit findings (2026-09-12)

### 🔴 Critical — security

| # | Issue | Where |
|---|---|---|
| S1 | **Middleware never runs.** File sits at `src/app/middleware.ts`; Next.js only loads `src/middleware.ts`. So `/salon/dashboard` and `/checkout` are unprotected at the edge. | `src/app/middleware.ts` |
| S2 | **Super-admin login was client-side only.** Compared against `NEXT_PUBLIC_*` vars (shipped to browser), created no session; `/Superadmin/dashboard` was directly reachable by anyone. *Resolved by keeping the credentials hardcoded (requirement) but verifying them on the server and issuing a session cookie — see §4.* | `src/app/Superadmin/login/page.tsx` |
| S3 | **`/users` is a public admin CRUD.** Lists every user's name+email; delete/update server actions have no auth. | `src/app/users/**` |
| S4 | **~70 API routes have no auth check**, including admin mutations: Banners, Category, Coupons, Attribute, Stock, Payouts (create!), `GET /api/customers` (dumps all customers), `POST /api/bookings/update-status` (anyone can complete/cancel any booking), `bookings/salon-admin`. | `src/app/api/**` |
| S5 | Hardcoded fallback secret `"default_secret_key"` for JWT signing. | `src/lib/session.server.ts` |
| S6 | `MONGODB_URI` (with credentials) logged to console on every cold start. Full session/token/user objects logged in NextAuth callbacks. | `src/dbConnect.ts`, `src/lib/authOptions.ts` |
| S7 | Middleware calls `getSession()` which reads `localStorage` — always `null` on the server, so the whole registration-progress redirect block is dead code. | `src/app/middleware.ts` |

### 🔴 Critical — build is broken

`next build` → **Failed to compile** (exit 1). `tsc --noEmit` reports **123 errors** across 39 files. Main clusters:

| # | Cluster | Errors | Root cause |
|---|---|---|---|
| B1 | `src/app/salon/dashboard/server/**` | ~25 | Dead parallel backend from Lovable export: own `dbConnect` (7 errs), own models that **re-register the same Mongoose model names** (`Salon`, `Service`, `Order`, `Review`, `User`, `Product`) with different schemas, and API routes at `/salon/dashboard/server/api/*` that nothing calls. |
| B2 | `src/data/index.ts`, `src/app/Booking/data/salonData.ts` | 39 | Mock data doesn't match `types/index.ts` (`rating` vs `ratings`, `image` vs `images`, numbers as strings, missing fields). |
| B3 | `CustomUser` type conflicts | ~20 | `authOptions.ts` re-declares `module "next-auth"` with a narrower `Session.user` than `types/next-auth.d.ts`, dropping `isVerified`. Several files also use `session.user._id` / `.salon` which never existed. |
| B4 | `@/app/Booking/types/booking` missing `Salon`, `Review` exports | 4 | Types never written. |
| B5 | Vite leftovers | 4 | `vite.config.ts` imports `vite`, `lovable-tagger` (not installed). |
| B6 | Missing packages | 3 | `winston-daily-rotate-file`, `express`, `node-cron` imported but not in `package.json` (`logger.ts`, `jobs/registrationReminders.ts` — both dead). |
| B7 | Misc single-file errors | ~28 | Wrong prop types in `utils.tsx`, `react-day-picker` v9 API (`IconLeft`), missing `toast` import, `Date` vs `string`, `null` vs `undefined`, etc. |

### 🟠 High — repo / structure

| # | Issue |
|---|---|
| R1 | **Nested git repo** at `src/app/.git` (0 commits, no remote). Hides `src/app` changes from the main repo and pollutes searches. |
| R2 | Vite/Lovable leftovers: `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `*/vite-env.d.ts`, `*/App.tsx` (react-router `<BrowserRouter>` trees), `App.css`, `index.css`, Vite-style `eslint.config.js` (Next plugin not detected). |
| R3 | `react-router-dom` used in 3 files inside a Next.js app (`starting.tsx` `<Link to>`, Superadmin `Index/page.tsx` `useNavigate`, Superadmin `App.tsx`). `<Link>` outside a Router throws at runtime. |
| R4 | Root `layout.tsx` is `"use client"` → no server `metadata` export, manual `<head>`, `title` attr on `<html>`. Separate `src/app/metadata.ts` exports "Create Next App" and is unused. |
| R5 | Junk files at root: `server.ts` (broken component that returns `{children}` object), `query` (contains "MongoDB"), `bun.lockb` alongside `package-lock.json`, `tsconfig.tsbuildinfo`. |
| R6 | `logs/*.log` and winston audit files are committed. |
| R7 | Empty files: `src/lib/context.tsx`, `src/mongoose-models/VerificationToken.ts`, `src/app/Subscription/actions.ts`, `src/app/selfcare-products/components/utils.tsx`, `src/app/Booking/index.css`. |
| R8 | `src/mongoose-models/Salon.ts` does `delete mongoose.models.Salon` before registering — a hot-reload hack that breaks other modules holding a reference. |
| R9 | Links to `/login` in 5 files but `src/app/login` was deleted (404). |

### 🟡 Medium — dependencies (`package.json`)

| # | Issue |
|---|---|
| D1 | Package name is `glimmer`. |
| D2 | **19 unused deps**: `@clerk/nextjs`, `@emotion/react`, `@emotion/styled`, `@next-auth/mongodb-adapter`, `chart.js`, `react-chartjs-2`, `cookies-next`, `cors`, `cross-spawn`, `html2pdf`, `mongodb`, `multer`, `socket.io`, `socket.io-client`, `swr`, `use-debounce`, `react-router-dom` (after R3 fix). |
| D3 | `mongoose` is in **devDependencies** (needed at runtime → prod install breaks). |
| D4 | Junk devDeps: `npm`, `install`, `@types/mongoose` (deprecated, mongoose ships types), `@types/react-toastify`, `@types/socket.io*`, `@types/winston`, `@types/express`, `@types/cors`, `@types/cookie-parser`, `@types/node-cron`, `@types/bcrypt` (bcryptjs is used). |
| D5 | Used but undeclared: `@radix-ui/react-dialog`, `@radix-ui/react-slot`, `@radix-ui/react-collapsible`, `@radix-ui/react-toggle` (present only transitively). |
| D6 | `eslint-config-next` pinned to 15.1.0 while `next` is 15.5. |
| D7 | Three toast libraries (`react-hot-toast`, `react-toastify`, `sonner`) + shadcn `use-toast`. |

### 🟡 Medium — duplication (documented, not fixed in this pass)

- **5 copies of shadcn/ui** (`Booking/components/ui` 49 files, `Superadmin/dashboard/components/ui` 50, `salon/dashboard/components/ui` 49, `salon/components/ui` 4, `productpayment/components/ui` 4). `components.json` points at `@/components/ui` which doesn't exist.
- **4 copies of `cn()`** (`src/lib/utils.tsx` + 3 module-local `lib/utils.ts`).
- Home page imports `Button`/`Tabs` from the *Superadmin* ui folder.

---

## 3. Plan (what will be done, in order)

### Phase 0 — Repo hygiene
- [x] Remove nested `src/app/.git`
- [x] Delete Vite leftovers: `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `*/vite-env.d.ts`, `Booking/App.tsx`, `Superadmin/dashboard/App.tsx`, `Superadmin/dashboard/pages/Index`
- [x] Delete junk: `server.ts`, `query`, `src/app/metadata.ts`, empty files (R7) — **`bun.lockb` still present** (deletion blocked by tooling permissions; remove manually, npm is the package manager)
- [x] Replace `eslint.config.js` with Next.js flat config
- [x] Add `logs/` to `.gitignore`, untrack committed logs
- [x] Delete dead `src/lib/logger.ts`, `src/jobs/`, `src/lib/verifyToken.ts`, `src/hooks/useAuth.ts`

### Phase 1 — Security
- [x] Move middleware to `src/middleware.ts`; drop the dead localStorage block
- [x] Super-admin: server-side login API (`/api/superadmin/login`) checking the hardcoded credentials (overridable via `SUPER_ADMIN_EMAIL/PASSWORD`), issuing an httpOnly signed JWT cookie; middleware guards `/Superadmin/dashboard/*` and `/users/*`
- [x] Remove hardcoded fallback secrets (S2, S5) — fail fast if env missing
- [x] Add `requireSuperAdmin()` / `requireSalonAdmin()` helpers and apply to admin API routes (Banners, Category, Coupons, Attribute, Stock, Payouts, customers, superadmin/*, bookings/update-status, bookings/salon-admin, users server actions)
- [x] Stop logging `MONGODB_URI` and session/token payloads

### Phase 2 — Make it build
- [x] Delete dead `src/app/salon/dashboard/server/` (B1)
- [x] Unify NextAuth types: single augmentation in `types/next-auth.d.ts`, remove the conflicting one in `authOptions.ts`; add `isVerified` to JWT/session (B3)
- [x] Add `Salon` / `Review` to `Booking/types/booking.ts` (B4)
- [x] Fix mock data to match types (B2)
- [x] Fix remaining per-file errors (B7)
- [x] Fix `react-router-dom` usages → `next/link` / `next/navigation` (R3)
- [x] Root layout → server component with `metadata`; providers in a client wrapper (R4)
- [x] Redirect `/login` → `/auth/signin` in `next.config.ts` (R9)
- [x] Verify: `tsc --noEmit` = 0 errors, `eslint .` = 0 errors, `next build` succeeds (153 static pages, middleware registered)

### Phase 3 — Dependencies
- [x] Rename package to `salonsphere`
- [x] Remove unused deps/devDeps (D2, D4), move `mongoose` to deps (D3), add missing radix packages (D5), align `eslint-config-next` (D6)
- [x] `npm install` to refresh lockfile

### Phase 4 — Recommended follow-ups (not in this pass)
- Consolidate the 5 shadcn/ui copies into `src/components/ui` and the 4 `cn()` helpers into `src/lib/utils`
- Pick one toast library
- Add auth to the remaining public-but-sensitive routes case by case (orders, notifications, drafts, gallery, services mutations)
- Replace `delete mongoose.models.Salon` hack with the standard `models.X || model()` pattern
- Add rate limiting to auth/registration endpoints (`RATE_LIMIT_*` env vars exist but are unused)

---

## 4. Conventions going forward

- **One model dir:** `src/mongoose-models/`. Register with `mongoose.models.X || mongoose.model("X", schema)`.
- **One DB connector:** `import dbConnect from "@/dbConnect"`.
- **Auth in API routes:** use the helpers in `src/lib/auth/guards.ts` — never trust a `salonId` from the request body for ownership checks.
- **Secrets:** never `NEXT_PUBLIC_` for credentials; never hardcode fallbacks — throw if missing.
- **Routing/links:** `next/link` + `next/navigation` only. No `react-router-dom`.
- **Middleware:** lives at `src/middleware.ts` (not inside `app/`).
- **Type-check before commit:** `npm run typecheck` (tsc) and `npm run lint` must be clean.
- **Super-admin login is hardcoded (project requirement).** Defaults live in `src/lib/auth/superadmin-credentials.ts` (`Superadmin@gmail.com` / `Superadmin@123`) and can be overridden with `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` in `.env`. The check runs **server-side** (`POST /api/superadmin/login`) and issues an httpOnly cookie — the password is never shipped to the browser, and `/Superadmin/dashboard/*` stays protected by `src/middleware.ts`. `NEXTAUTH_SECRET` (or `SESSION_SECRET`) must be set to sign that cookie.
- **Pages using `useSearchParams()`** must be wrapped in `<Suspense>` (see any of the 12 pages listed in the change log for the pattern).

---

## 5. How to run

```bash
npm install          # once
npm run dev          # http://localhost:3000  (Turbopack; first page compile takes ~30-60 s)
npm run build        # production build — must pass before committing
npm start            # serve the production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
```

`.env` must contain at least `MONGODB_URI`, `DB_NAME`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (plus Cloudinary / SMTP / Stripe keys for those features).

| Login | URL | Credentials |
|---|---|---|
| Super-admin | `/Superadmin/login` | `Superadmin@gmail.com` / `Superadmin@123` (hardcoded, see §4) |
| Salon owner | `/salon/login` | salon account from MongoDB (`salons` collection) |
| Customer | `/auth/signin` | customer account or Google |

A `.claude/launch.json` entry (`salonsphere-dev`) is included for the Claude Code browser preview.

---

## 6. Change log

### 2026-09-14 — Hardcoded super-admin login, runtime verification, build

- **Super-admin credentials hardcoded again** (project requirement) in server-only `src/lib/auth/superadmin-credentials.ts`; `/api/superadmin/login` reads from there. Server-side verification + httpOnly cookie + middleware guard from the previous pass are kept.
- Ran the app and exercised it in the browser: home, salons, salon detail, booking (calendar + timeslots), products, salon login, super-admin login → dashboard → every dashboard page → logout. All 200 / correct redirects; no server errors.
- Verified guards end-to-end: admin APIs return **401 without** the super-admin cookie and **200 with** it; `/Superadmin/dashboard`, `/users`, `/salon/dashboard`, `/checkout` redirect when unauthenticated; wrong password → 401.
- Fixed while testing:
  - `public/placeholder.svg` was referenced in 39 places but did not exist (broken product images) — added it; `placeholder-image.png` references pointed at the same file.
  - Superadmin sidebar logo linked to `/Superadmin/dashboard/dashboard` (404) → now `/Superadmin/dashboard`.
  - `/salon/register` (no index page, linked from email verification) → redirects to `/salon/register/basic-info`.
  - Three Mongoose "Duplicate schema index" warnings (`Attribute.name`, `Coupon.code`, `Payout.orderId`, plus `Plan.name`) — removed the redundant `schema.index()` / `index: true`.
  - `Salon` model no longer does `delete mongoose.models.Salon` (the conflicting duplicate model it was working around is gone); uses the standard `models.X || model()` pattern.
- Added `.claude/launch.json` for the dev-server preview.
- Hydration warning `cz-shortcut-listen="true"` on `<body>`: caused by the ColorZilla browser extension injecting an attribute before React hydrates (not a code bug). Added `suppressHydrationWarning` to `<body>` in `src/app/layout.tsx` — silences attribute diffs on that element only.
- **Verification:** `tsc` 0 errors · `eslint .` 0 errors / 88 warnings · `next build` ✓ (153 pages, middleware 59 kB) · `next start` smoke test ✓ · dev server left running on :3000.


### 2026-09-12 — Audit + cleanup pass

**Repo hygiene**
- Removed stray nested git repo `src/app/.git` (0 commits, no remote).
- Deleted Vite/Lovable leftovers: `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `Booking/{App.tsx,vite-env.d.ts,index.css}`, `Superadmin/dashboard/{App.tsx,vite-env.d.ts,pages/Index}`.
- Deleted junk/dead files: `server.ts`, `query`, `tsconfig.tsbuildinfo`, `src/app/metadata.ts`, `src/lib/{logger,verifyToken,context}.ts(x)`, `src/hooks/useAuth.ts`, `src/jobs/`, `src/app/controllers/orderController.ts` (Express), empty files (`VerificationToken.ts`, `Subscription/actions.ts`, `selfcare-products/components/utils.tsx`).
- `eslint.config.js` → Next.js flat config (`next/core-web-vitals` + `next/typescript` via `FlatCompat`).
- `logs/` git-ignored and untracked.

**Security**
- `src/middleware.ts` (new, correct location) guards `/salon/dashboard/*` (role `salon_admin`), `/checkout/*` (role `customer`), `/Superadmin/dashboard/*` and `/users/*` (super-admin cookie). Old `src/app/middleware.ts` removed.
- New super-admin auth: `POST /api/superadmin/login` verifies `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` (server-only env, constant-time compare) and sets an httpOnly `superadmin_session` JWT cookie (8 h); `POST /api/superadmin/logout` clears it. Login page and sidebar logout wired to these. Hardcoded fallback credentials removed.
- New `src/lib/auth/guards.ts` (`requireSuperAdmin`, `requireSalonAdmin`, `requireCustomer`, `requireSuperAdminOrSelf`, `requireSuperAdminOrOwnSalon`) and edge-safe `src/lib/auth/superadmin-token.ts`.
- Guards applied: super-admin on all methods of `Category`, `Attribute`, `Stock`, `coupons`, `superadmin/product-stats`, `GET /api/customers`; super-admin on mutations of `Banners`, `products` (GETs stay public for the storefront); `payouts` GET scoped to own salon / POST super-admin; `customers/[id]` super-admin or self; `bookings/salon-admin` + `bookings/update-status` now take `salonId` from the session and refuse cross-salon access; `/users` server actions require super-admin.
- `session.server.ts` no longer falls back to `"default_secret_key"` (throws if `SESSION_SECRET`/`NEXTAUTH_SECRET` missing).
- `dbConnect.ts` no longer logs the connection string; listeners registered once instead of per call. `authOptions.ts` no longer logs session/token/user payloads.

**Build (123 → 0 TypeScript errors)**
- Deleted dead `src/app/salon/dashboard/server/**` (parallel dbConnect + conflicting models + orphan API routes) and `src/app/salon/dashboard/types/next-auth.d.ts` (third conflicting augmentation).
- `authOptions.ts` rewritten: single NextAuth type augmentation (`types/next-auth.d.ts`), `isVerified` propagated through JWT → session, safe `redirect` callback.
- `Booking/types/booking.ts`: added `Salon`, `Review`, `SalonGender`, `TimeSlot.bookedCount`; `Service.category/isActive` optional.
- `types/index.ts`: added `SalonCardType` (storefront cards), `ReviewType.image`, optional mock-only fields on `AreaType`/`ReviewType`, `rating: string | number`, `AddToCartBtnProps.disabled` optional; removed duplicate `SalonWorkingHours`.
- `src/data/index.ts`: product mocks normalised via `withProductDefaults()`; `rating` → `ratings` on salons.
- `react-router-dom` removed from `common/starting.tsx` (→ `next/link`).
- Root `layout.tsx` is now a server component exporting `metadata`; client providers moved to `src/app/providers/AppProviders.tsx` (replaces `providers/AuthProvider.tsx`).
- `next.config.ts`: `/login` → `/auth/signin` redirect.
- Per-file fixes: `add-product-dialog.tsx` (toast hook, tags as `{value}[]` field array, tags sent to API), Superadmin `calendar.tsx` (react-day-picker v9 `Chevron`), `User` model gained `gender/age/location` (the `/users` forms were writing fields the schema dropped), `generatetimeslots.ts` (missing `format` import, optional scheduling), `validation.ts` (`checkPasswordStrength`), `CardImage`/`AddToCartBtn` now use their shared prop types, `orders/[id]` uses `SUPER_ADMIN_EMAIL` (was misspelled `SUPERADMIN_EMAIL`), plus assorted `null`/`undefined`/`Date`/`string` mismatches.

- 12 pages that call `useSearchParams()` (`auth/{error,register,verify}`, `bookings`, `order-confirmation`, `review`, `salon/register/{payment,plan-selection,verification}`, `salon/reset-password`, `salons/[id]/book`, `verify-email/[token]`) wrapped in `<Suspense>` — required by Next 15 for static prerendering; the build had never reached this stage before.
- `orders` routes: SMTP `transporter.verify()` no longer runs during `next build` (guarded by `NEXT_PHASE`).
- `checkout/page.tsx`: `<a href>` → `<Link>` for internal navigation; `react/no-unescaped-entities` turned off (cosmetic); `tailwind.config.ts` plugins use `import` instead of `require`.

**Dependencies**
- Package renamed `glimmer` → `salonsphere`; scripts: `lint` = `eslint .`, new `typecheck`.
- Removed 18 unused deps + 15 junk devDeps (see D2/D4); `mongoose` moved to `dependencies`; `uuid`, `@radix-ui/react-{dialog,slot,collapsible,toggle}` declared; `@types/jsonwebtoken`, `@types/uuid`, `@eslint/eslintrc` in devDeps; `eslint-config-next` → 15.5.x; `react-leaflet` 4 → 5 (React 19 peer; API used is unchanged).
- `npm install` refreshed `package-lock.json` (325 orphan packages removed).

**Verification**
- `npx tsc --noEmit` → 0 errors (was 123)
- `npx eslint .` → 0 errors, 88 warnings (mostly `<img>` → `next/image`, hook deps)
- `npx next build` → ✓ exit 0, 153 static pages, `ƒ Middleware` registered
- Nothing has been committed — review `git status` / `git diff` and commit when satisfied.

**Not done / needs you**
- `bun.lockb` could not be deleted by tooling — remove it manually (`npm` is the package manager).
- Phase 4 follow-ups (shadcn/`cn()` consolidation, single toast lib, remaining public routes, rate limiting) — see §3.
