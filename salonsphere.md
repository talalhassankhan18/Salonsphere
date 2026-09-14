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

**If every page says "Failed to load…" / the log shows `ECONNREFUSED 127.0.0.1:27017`:** MongoDB is
down. Check `sc query MongoDB` and free disk space, then `Start-Service MongoDB` from an admin
PowerShell. Run `scripts\mongodb-harden.ps1` once (as admin) so it auto-restarts and uses less RAM —
see §9.1 for why.

| Login | URL | Credentials |
|---|---|---|
| Super-admin | `/Superadmin/login` | `Superadmin@gmail.com` / `Superadmin@123` (hardcoded, see §4) |
| Salon owner | `/salon/login` | salon account from MongoDB (`salons` collection) |
| Customer | `/auth/signin` | customer account or Google |

A `.claude/launch.json` entry (`salonsphere-dev`) is included for the Claude Code browser preview.

---

## 6. Change log

### 2026-09-14 (later) — Sync with GitHub (`origin/main`)

**Situation:** the local copy was a 13-May-2025 snapshot; GitHub `main` had 29 newer commits (20–21 May + 20 Aug 2025 work, a Next CVE pin, README rewrite) that had never been pulled. VS Code's push was rejected ("Try running Pull first"). Simply pulling would have produced 123 conflicts against the audit changes.

**What was done**
- Audit work snapshotted on branch `audit-fixes`, then `origin/main` merged into it. Conflicts resolved by rule: remote version for anything the audit hadn't touched; audit version for hand-edited files; mechanical edits (API guards, Suspense wrappers, `placeholder.svg`) re-applied on top of the remote versions. Remote's removal of `/users`, `/register`, `/signup` accepted.
- **Dropped the remote's `ignoreBuildErrors: true` / `ignoreDuringBuilds: true`** (next.config.ts) — it was hiding real breakage. Fixed what it hid:
  - 11 route handlers with sync `params` → Next 15 `Promise` form.
  - `api/orders/salon/[id]` read `params.salonId` (segment is `[id]` → always undefined) and let any salon admin read any salon's orders → now uses `id` and `requireSuperAdminOrOwnSalon`.
  - `api/support/email` used a Pages-API `res: NextApiResponse` param.
  - Navbar/Cart lost their props on the remote but callers still passed them (5 files).
  - `api/upload/route.ts` was an **empty file** (salon registration image upload was broken) → real Cloudinary upload (`images[]` → `{ imageUrls }`, 5 files / 5 MB / image types only).
  - `auth/error/page.tsx` was empty → restored.
- `next` floor raised to `^15.3.8` (matches the remote CVE fix; resolves to 15.5.x).
- Local `main` fast-forwarded to the merged result → `ahead 3, behind 0` of `origin/main`; push is a clean fast-forward.

**Verification:** `tsc` 0 errors · `eslint .` 0 errors · `next build` ✓ (150 pages, middleware) · dev smoke test: all pages 200 / correct redirects, admin APIs 401→200 with cookie, all 16 super-admin pages 200.

**Git conventions from here:** always `git pull` (or Fetch + Pull in VS Code) **before** starting work; never re-enable `ignoreBuildErrors` — fix the error instead.


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

---

## 7. Pass 3 — 2026-09-14 (afternoon): branch reconciliation + remaining API auth

### 7.1 Situation found

This working copy (`Downloads/Personal Data/SalonSphere`) was a **stale snapshot**: it sat at
`59321a9 packages installation` (the pre-audit base) plus one local commit `Latest Updates`
(Prettier trailing-commas in `api/orders/route.ts` + phone number `03335759985 → 03255664245`
in `order-confirmation/page.tsx`). Meanwhile `origin/main` already carried the whole audit from
§6 (9 commits ahead). `git status` reported *"diverged, 1 and 9 different commits"* and a push
was impossible.

Force-pushing this folder would have deleted the audit. Instead:

- [x] Backup branch `local-backup-2026-09-14` created at the old local `main`.
- [x] `git rebase origin/main` — clean, no conflicts. `main` is now `origin/main + 1`
      (fast-forward push). The phone-number change is preserved.
- [x] `npm install` to match the rewritten `package.json` (155 added / 429 removed).
- [x] Baseline verified after rebase: `tsc` 0 errors · `eslint .` 0 errors / 93 warnings.
- [ ] **Manual cleanup needed (tooling refused to delete):** `server.ts`, `bun.lockb` (both
      still tracked — the §6 note says they were removed but the merge with origin brought
      them back) and the empty nested repo `src/app/.git`. Run:
      `git rm server.ts bun.lockb && rm -rf src/app/.git`

### 7.2 Findings — API routes still without authorization

Mapped all 94 `route.ts` files for HTTP methods vs. guard usage. Legitimately public routes
(auth, registration, listings, health, contact, geocode, reviews-by-token, guest booking
cancel-by-email) were excluded. The following are **mutations or private reads with no auth
and no ownership check** — `salonId` / `userId` is taken straight from the request body:

| # | Route | Methods | Impact | Callers |
|---|---|---|---|---|
| A1 | `api/notifications` | POST | **Anyone can broadcast a notification to every customer and salon** (`target: "all"`). | Superadmin page (broadcast), booking page (`salonAdmin` target) |
| A2 | `api/notifications` | GET | No `userId` → dumps *all* notifications; with `userId` → anyone's. Also `console.log`s the full list. | dashboard header, customer notifications page |
| A3 | `api/notifications` | DELETE | Anyone can delete any notification. | Superadmin page |
| A4 | `api/notifications/mark-read` | POST | Anyone can mark anyone's read. | dashboard header, customer page |
| A5 | `api/notifications/sse` | GET | Anyone can subscribe to anyone's live stream by `userId`. | same |
| A6 | `api/services` | POST | Add a service to any salon. | salon dashboard |
| A7 | `api/services/[id]` | PUT, DELETE | Edit/delete any salon's service. | salon dashboard |
| A8 | `api/gallery` | POST | Upload to Cloudinary under any salon (cost/abuse). | salon dashboard |
| A9 | `api/gallery/[id]` | DELETE | Delete any salon's gallery image (also from Cloudinary). | salon dashboard |
| A10 | `api/salon/products` | POST, PUT, DELETE | List/delist/restock products for any salon; DELETE has no salon check at all. | salon dashboard |
| A11 | `api/salon/scheduling` | PATCH | Overwrite any salon's business hours. | **none** (dead) |
| A12 | `api/timeslots/mark-available` | POST | Free any salon's booked slots (double-booking). | salon dashboard |
| A13 | `api/setting`, `api/setting/[id]` | all | Platform settings CRUD. | Superadmin page |
| A14 | `api/orders/latest` | GET | "Auth" is `Authorization: Bearer <customerId>` — the id *is* the token. | **none** (dead) |
| A15 | `api/customers/[id]/notifications` | PUT | Toggle read on any customer's embedded notifications. | **none** (dead) |

Related defects found while tracing callers:

| # | Issue |
|---|---|
| N1 | `api/notifications/route.ts` exports non-HTTP helpers (`addClient`, `removeClient`, `emitNotification`) that `sse/route.ts` imports — route files should only export handlers. |
| N2 | `api/bookings/cancel` "sends" a cancellation notification via an HTTP `fetch` to `/api/notifications` with body `{userId, adminId, userEmail, message}` — the endpoint requires `{title, content, type, target}`, so **this always 400s and is swallowed by its try/catch. Cancellation notifications have never been delivered.** |
| N3 | `mongoose-models/Notification.ts` still has the `delete mongoose.models.Notification` hot-reload hack (the last one — §6 removed it from `Salon`). |
| N4 | `npm audit`: 17 vulns (2 critical, 9 high). Criticals: `next` 15.5.22 → **unauthenticated RCE on Windows-hosted servers + image-optimizer RCE** (fixed ≥ 15.5.24); `next-auth` 4.24.14 → email-normalization homoglyph bypass (fixed 4.24.15). Non-breaking fixes exist for all but `@faker-js/faker` (9→10), `uuid` (8→14), `nodemailer` (7→10) — all three only use APIs that are unchanged across those majors (`faker.commerce/lorem/number/string`, `uuid.v4`, `nodemailer.createTransport`). |

### 7.3 Plan for this pass

**Notifications (A1–A5, N1–N3)**
- [x] New `src/lib/notifications.ts`: SSE client registry + `createNotification()` (recipient resolution, save, emit). Route files import from here.
- [x] `GET /api/notifications`: require a session; `userId` must equal the caller's own id (customer `session.user.id`, salon `session.user.userId`) unless super-admin. Drop the payload logging.
- [x] `POST /api/notifications`: super-admin → any target. Anyone else → only `{ target: "salonAdmin", type: "booking", salonId }` (the guest-booking path).
- [x] `DELETE /api/notifications`: super-admin.
- [x] `POST /api/notifications/mark-read`: session required; caller must be in `recipientIds` (or super-admin).
- [x] `GET /api/notifications/sse`: session required; `userId` must be the caller's own.
- [x] `api/bookings/cancel`: call `createNotification()` directly (fixes N2).
- [x] `Notification.ts`: standard `models.X || model()` (N3).

**Salon-owned resources (A6–A12)** — `requireSalonAdmin()`; ignore any `salonId` in the body and use the session's; verify the target document belongs to that salon.
- [x] `api/services` POST · `api/services/[id]` PUT, DELETE
- [x] `api/gallery` POST · `api/gallery/[id]` DELETE
- [x] `api/salon/products` POST, PUT, DELETE
- [x] `api/salon/scheduling` PATCH
- [x] `api/timeslots/mark-available` POST

**Super-admin only (A13)**
- [x] `api/setting` GET, POST · `api/setting/[id]` PUT, DELETE → `requireSuperAdmin()`

**Dead-but-dangerous (A14, A15)** — guard rather than delete, so nothing that might link to them breaks:
- [x] `api/orders/latest` → `requireCustomer()`, order looked up by session id.
- [x] `api/customers/[id]/notifications` → `requireSuperAdminOrSelf(id)`.

**Dependencies (N4)**
- [x] `npm audit fix` (non-breaking) + manual bump of `@faker-js/faker`, `uuid`, `nodemailer`.

**Verify + ship**
- [x] `tsc` 0 · `eslint` 0 errors · `next build` passes.
- [x] Commit, push `main` (fast-forward), confirm `git status` = "up to date with origin/main".

Frontend callers do not need changes: every dashboard page already sends `session.user.salonId`,
and the guarded routes keep accepting the same request shape — they just stop trusting it.

### 7.4 What was done (change log for this pass)

**Notifications**
- New `src/lib/notifications.ts` — SSE client registry (`addClient` / `removeClient` /
  `emitNotification`) and `createNotification()` / `resolveRecipients()`. Route files now only
  export HTTP handlers.
- New guard `requireNotificationIdentity()` in `src/lib/auth/guards.ts` → `{ isSuperAdmin,
  recipientIds }` (customer → `session.user.id`; salon admin → `session.user.id` +
  `session.user.userId`).
- `GET /api/notifications` — session required; non-admins may only pass their own `userId`
  (403 otherwise). Removed the `console.log` that dumped every notification on each request.
- `POST /api/notifications` — super-admin for any target; without the cookie only
  `{ target: "salonAdmin", type: "booking", salonId }` is accepted (the guest-booking ping).
  Recipient-resolution errors now return 400 instead of 500.
- `DELETE /api/notifications` — super-admin only.
- `POST /api/notifications/mark-read` — session required; the update filter includes
  `recipientIds ∈ caller` so a non-recipient gets 404. `notificationId` validated as ObjectId.
- `GET /api/notifications/sse` — session required; `userId` must be the caller's own.
- `api/bookings/cancel` — replaced the broken `fetch("/api/notifications")` hop with a direct
  `createNotification({ type: "status_update", target: "salonAdmin", … })`. Salon admins now
  actually receive cancellation notifications.
- `mongoose-models/Notification.ts` — `models.Notification || model()`; hack removed.

**Salon-owned resources — `requireSalonAdmin()`, `salonId` from the session, ownership checked**
- `POST /api/services` · `PUT|DELETE /api/services/[id]` (service must belong to caller's salon)
- `POST /api/gallery` · `DELETE /api/gallery/[id]` (image must belong to caller's salon)
- `POST|PUT|DELETE /api/salon/products` (DELETE now filters on `salonId` too)
- `PATCH /api/salon/scheduling` (`findByIdAndUpdate(session.salonId)` instead of body `userId`)
- `POST /api/timeslots/mark-available`
- Body fields `salonId` / `userId` are ignored where present — callers unchanged.

**Super-admin only** — `GET|POST /api/setting`, `PUT|DELETE /api/setting/[id]`.

**Previously dead + dangerous** — `GET /api/orders/latest` → `requireCustomer()`, order by
session id (fake Bearer scheme removed). `PUT /api/customers/[id]/notifications` →
`requireSuperAdminOrSelf(id)`.

**Dependencies**
- `npm audit fix` + `@faker-js/faker` 9→10.6, `uuid` 8→14 (`@types/uuid` dropped — uuid ships
  types), `nodemailer` 7→10.0.9.
- `next` 15.5.22 → **15.5.25** (unauthenticated RCE on Windows hosts + image-optimizer RCE
  patched), `next-auth` 4.24.14 → 4.24.15, plus axios / mongoose / form-data / nanoid / js-yaml /
  dompurify / qs / sharp transitive fixes.
- `package.json` `overrides: { nodemailer: "$nodemailer" }` — `next-auth` has an *optional* peer
  on `nodemailer ^7`; without the override every later `npm install` / `npm ci` (incl. Vercel)
  fails with ERESOLVE. The app does not use next-auth's EmailProvider, so the override is safe.
- **17 → 2 vulnerabilities.** The remaining two are `postcss` bundled *inside* `next` 15.5 —
  only fixable by Next 16 (major). Build-time tool, not reachable from user input; deferred.

**Verification**
- `npx tsc --noEmit` → 0 errors · `npx eslint .` → 0 errors / 93 warnings (unchanged) ·
  `npx next build` → ✓ compiled, all pages, middleware 61.6 kB · `npm ci` clean.
- Dev-server smoke test (curl): all 21 guarded method/route pairs → **401** with no session;
  guest-booking `POST /api/notifications` → passes auth (400 on a fake salon, not 401);
  public `GET` listings (`services`, `gallery`, `salon`, `salon/products`, `health`) unchanged.
  With the super-admin cookie: `setting` 200, `notifications` GET 200 / POST 201 / mark-read 200
  / DELETE 200 (test draft created and removed). Home page renders normally.

**Git** — `main` rebased onto `origin/main` (backup at `local-backup-2026-09-14`), this pass
committed on top, pushed as a fast-forward.

### 7.5 Still open (next pass)

- Manual: `git rm server.ts bun.lockb && rm -rf src/app/.git` (see §7.1).
- `POST /api/upload` (registration image upload, pre-auth by design) and `api/draft/*` /
  `api/salon/progress` (registration drafts keyed by email) have no auth — add rate limiting
  (`RATE_LIMIT_*` env vars exist but are unused) and consider a signed registration token.
- `POST /api/bookings/cancel` authenticates guests by `bookingId + email` — acceptable for the
  guest flow, but when a session exists it should additionally require `session.email` to match.
- Next 16 upgrade to clear the last 2 `postcss` advisories.
- Phase 4 items from §3 still stand: consolidate the 5 shadcn/ui copies + 4 `cn()` helpers, pick
  one toast library, the 93 lint warnings (`<img>` → `next/image`, `prefer-const`, hook deps).

---

## 8. Pass 4 — 2026-09-14 (evening): home page shows registered salons, not mock data

**Reported:** "on user's home page I'm unable to see registered salons, the home page is showing
dummy data."

**Cause:** `src/app/components/salon-card-list.tsx` took an optional `salons` prop and fell back
to the `SalonsData` mock array from `src/data/index.ts` ("salon 1"…"salon 8" with bundled PNGs).
`page.tsx` rendered `<SalonCardList />` with no prop, so the mock always won. The same mock fed
`salons/[id]/components/salons-nearby.tsx`, which filtered it by *exact address match* — on real
data that never matched, so every salon page said "No nearby salons found."

**Done**
- New `src/lib/salon-cards.ts` — `toSalonCard()` (API salon → `SalonCardType`),
  `sortNewestFirst()`, `SALON_FALLBACK_IMAGE`.
- `salon-card-list.tsx` → client component that fetches `GET /api/salon` (already filtered to
  `isVerified && paymentStatus === "completed"`), sorts newest-first, shows up to **8** (the
  "Salons" heading still links to `/salons` for the full list). Loading / error / "No salons
  registered yet." states. Fetch is aborted on unmount.
- `salons-nearby.tsx` → client component. When the current salon has coordinates it calls
  `GET /api/salon/nearby?lat&lng&distance=10000&excludeId` (real Haversine query, up to 4);
  otherwise falls back to the newest registered salons under an "Other Salons" heading.
  `salons/[id]/page.tsx` now selects `latitude longitude` and passes `_id` + coords instead of
  `address`.
- Deleted `SalonsData` and the four `@/assets/salons/salon-N.png` mock images (no other users).
- `/default-salon-image.jpg` was referenced as the avatar fallback in **9 places** but never
  existed in `public/` → all now `/placeholder.svg` (`api/salon`, `api/salon/nearby`,
  `api/salon/details`, salon dashboard Settings, `about-salon.tsx`, `salons/[id]/page.tsx`).

**Verified:** `tsc` 0 · `eslint` 0 errors · `next build` ✓ · dev server: home page renders all
7 registered salons (The Beauty Loft, zaeraSalon, kajal, Glam, Divine, depilex, Glamour) with
their Cloudinary avatars and working `Book Now` links; `/salons/Divine` shows "Glamour" under
Nearby Salons (both Islamabad). No mock names, no server errors.

**Note for later:** `GET /api/salon` `console.log`s the entire raw Mongo result on every call
("Raw MongoDB Salons") — noisy and leaks salon emails/phones into server logs. Not changed in
this pass; worth removing.

---

## 9. Pass 5 — 2026-09-14 (late): UI audit + "Failed to fetch salons (500)"

### 9.1 The 500s — root cause was the machine, not the code

`Failed to fetch salons (500)` / `ECONNREFUSED 127.0.0.1:27017` = **MongoDB is not running**.
It crashed **twice** on 2026-09-14 (15:38 and 16:53). `mongod.log` says why:

- 15:38 — `terminate() called` right after "saving checkpoint": **C: had 0.0 GB free**, so
  WiredTiger could not write and Windows could not grow the pagefile.
- 16:53 — `Writing fatal message: out of memory`: **this PC has 7.7 GB RAM.** At the time it was
  running mongod + Next dev (Turbopack) + `next build` + Chrome + VS Code + MongoDB Compass + WSL.
  mongod's default WiredTiger cache is 50 % of (RAM − 1 GB) ≈ **3.3 GB**, so it is the first thing
  Windows starves.

Done:
- [x] Service restarted both times (needs a UAC prompt; the data dir is under Program Files).
- [x] Freed ~7.9 GB: deleted `.next/` (2.0 GB, regenerated by every build) + `npm cache clean --force` (5.8 GB).
- [x] `dbConnect.ts`: `serverSelectionTimeoutMS` 5000→3000, `connectTimeoutMS` 10000→5000,
      `family: 4` (mongod binds 127.0.0.1 only — the driver was trying `::1` first and failing).
      A DB outage now surfaces in ~3 s instead of hanging every request for 11 s.
- [x] `console.error` → `console.warn` in the salon-fetch `catch` blocks so Next 15's dev overlay
      stops presenting a rendered error state as a crash.
- [x] **`scripts/mongodb-harden.ps1`** — run once as admin. Sets the service to auto-restart on
      failure (5 s / 10 s / 30 s) and caps WiredTiger cache at **0.5 GB** in `mongod.cfg` (backup
      written alongside). Dry-run of the YAML edit verified against the real file.

- [ ] **You:** `powershell -ExecutionPolicy Bypass -File .\scripts\mongodb-harden.ps1` (it
      self-elevates). Keep ≥ 5 GB free on C:. Close MongoDB Compass / WSL when not in use. Don't
      run `next build` while `npm run dev` is up — together they OOM this machine.

### 9.2 UI audit — method

All 48 public pages curl-checked (all 200). Then every page opened in the in-app browser with a
diagnostic (broken `<img>`, `scrollWidth > clientWidth`, missing `<h1>`, `href="#"`, console
errors) at 1280 px and at 375 px, plus code sweeps for: links/fetches to routes that don't exist,
image paths missing from `public/`, hardcoded deployment URLs, `Math.random`/`Date` during
render, icon-only buttons with no accessible name. Super-admin: all 16 pages logged in and
checked. **Salon dashboard: code-swept only** (no salon test login available).

### 9.3 Fixed — broken flows

| Where | Problem | Fix |
|---|---|---|
| `selfcare-products/[id]` | Server component fetched **`https://salonsphere.vercel.app/api/products/…`** — a hardcoded production URL. Every product page showed "Product not found" locally / on any other host. | Direct Mongoose query (same as `GET /api/products/[id]`). |
| `api/send-verification-email` | Verification link was **`http://localhost:3000/auth/verify?…`** — customer verification emails in production pointed at localhost. | `${NEXTAUTH_URL}/auth/verify`. |
| `api/registercustomer` | Called `NEXT_PUBLIC_API_URL \|\| "http://localhost:3000"` — var is unset, so production called localhost and **no verification email was sent**. | `NEXTAUTH_URL`. |
| `salon/login` | `callbackUrl` built from `NEXT_PUBLIC_NEXTAUTH_URL \|\| "https://salonsphere.vercel.app"` — local logins tried to redirect off-site. | Relative `/salon/dashboard`. |
| `salons/[id]/components/recommended-products` | Server component fetching its own API via `NEXT_PUBLIC_BASE_URL \|\| localhost`. | Client component, relative fetch, loading state. |
| `api/bookings` POST | Server-side "New Booking" notification posted `{salonId, message, type}` — endpoint needs `title/content/target`, so it **always 400'd silently** (same bug as `bookings/cancel` in §7). The book page also sent one from the client, masking it. | `createNotification()` directly; client duplicate removed. |
| `Superadmin/…/productStats` | Fetched **`/api/salon/list`** — no such route; fell through to `/api/salon/[id]` with `id="list"` → 400 on every load. | `/api/salon`, mapped `salonName → name`. |
| `salon/pending-approval` | Fetched **`/api/salon/pending`** (same fall-through), rendered `salon.basicInfo.*` / `salon.location.*` — fields that exist in **no** model, sent salon owners to the *customer* login. | Reads `/api/salon/[session.salonId]`, real fields, `/salon/login`, status derived from `isVerified` + `paymentStatus`. |
| `api/salon/nearby` | `$function` server-side JS with `lat`/`lng` spliced into source; `_id: {$ne: "<string>"}` never excluded. | Native `$degreesToRadians/$sin/$cos/$atan2`; ObjectId cast. |

### 9.4 Fixed — UI / layout / a11y

- **Super-admin dashboard scrolled sideways** on Orders (446 px) and Products (62 px): the
  content column was `flex-1 flex flex-col` without `min-w-0`, so a wide table blew the column
  past the viewport despite its own `overflow-auto` wrapper. One class on
  `Superadmin/dashboard/layouts/DashboardLayout.tsx` fixed every page.
- **Booking page: past time slots were clickable** — you'd tap 9:00 AM at 4 PM and get an error
  toast after a ~1 s API round-trip. Past slots now render disabled (`isAvailable && !isBefore`).
- **Hydration mismatch on `/ContactUs`**: `useState(() => images[Math.random()…])` ran on server
  and client with different results. Fixed image for SSR, randomised in `useEffect`.
  Same pattern in `Payment/CartPage/components/RecommendedAddOns.tsx` made deterministic.
- Vendor ("For Business") navbar: `/support` → `/Support` (404 on case-sensitive hosts),
  `/customers` → `/`, `/language` removed, mobile Login/Sign Up → salon routes.
- Dead links → real routes: `/Login`, `/login`, `/register`, `/recommended-salons`,
  `/salons-nearby`, `/trending-salons`, and 15 `href="#"` Terms/Privacy/Contact placeholders.
- Salon dashboard "View all appointments": no-op `<button>` containing a stray
  `<link rel="stylesheet" href="/Appointments">` → real `<Link>`.
- Missing images: `/default-salon-image.jpg` (9 refs), `/default-product-image.jpg`,
  `/placeholder.png` (cart) — none existed → `/placeholder.svg`.
- Home page had no `<h1>` (headline is baked into the hero image) → `sr-only` h1.
- Hamburger button and chat launcher (8 pages): `aria-label` (+ `aria-expanded` on the menu).
- Deleted dead: `components/Ven.tsx` (linked 8 nonexistent routes),
  `common/old-card-list-wrapper.tsx`, `src/assets/salons/*.png`.
- Lint: `prefer-const` auto-fixed; lucide `Image` icon → `ImageIcon` in 4 files.

### 9.5 Verified

`tsc` 0 · `eslint` 0 errors · `next build` ✓ (187 routes, middleware) · browser: home (7 salons),
`/salons` (all 4 sections), `/salons/Glamour` → book → slot selection, product list → product
detail → add to cart → cart (badge, totals) → checkout redirects to sign-in with `callbackUrl`;
super-admin login + all 16 pages; mobile menu at 375 px. No horizontal overflow anywhere at
1280 px or 375 px. No new hydration errors.

### 9.6 Still open

- Salon dashboard (16 pages) needs a browser pass with a salon login.
- 51 `<img>` → `next/image` (lint warnings; needs `images.remotePatterns` for Cloudinary).
- 26 `react-hooks/exhaustive-deps` warnings (fetch-on-mount patterns).
- Orphan pages nobody links to: `/Payment/*`, `/Booking`, `/map`, `/orderdetailspage`,
  `/order-tracking`, `/coming-soon` — probably Lovable leftovers; decide keep/delete.
- `GET /api/salon` still `console.log`s the full raw Mongo result on every call.

### 9.7 Chatbot panel (2026-09-14, late) — clipped / overlapping navbar

`Support/components/Chatbot.tsx` stacked fixed heights (header + 300 px messages + input +
200 px suggestions ≈ 700 px) so on any window shorter than that the top was cut off and the
panel sat over the navbar. Now: card is `flex flex-col max-h-[calc(100dvh-3rem)]`, header and
input row are `shrink-0`, the message list is `flex-[0_1_300px] min-h-[8rem]` (shrinks first),
suggestions fixed at 7.5 rem. Verified at 1000×600 (panel 552 px, fully visible) and 375×812.

Also fixed in the same component:
- **Suggested questions never sent** — `setUserMessage(q); handleSendMessage()` read the stale
  closure value (empty) and returned early. `handleSendMessage(text?)` now takes the text.
- **No auto-scroll to the newest message** — `scrollAreaRef` was never attached (and Radix
  ScrollArea scrolls its inner Viewport anyway). Sentinel `<div ref>` + `scrollIntoView`.
- `aria-label` on the close and send icon buttons; `onKeyPress` → `onKeyDown`.

### 9.8 Navbar (2026-09-14, late) — banner hidden behind it; links centred

`common/navbar.tsx` is `position: fixed` (72 px) but nothing reserved that height in flow, so the
top 72 px of every page using it (home hero, /salons, /selfcare-products, /ContactUs, /cart,
/checkout, …) rendered underneath. Only `order-confirmation` had a manual `pt-20`.

- Nav container is now a fixed `h-[4.5rem]` and the component renders an `aria-hidden`
  `h-[4.5rem]` spacer after `</nav>` — every consumer gets the offset automatically.
  `order-confirmation`'s `pt-20` removed (would have doubled).
- Desktop layout is a 3-column grid `md:grid-cols-[1fr_auto_1fr]`: logo `justify-self-start`,
  links `justify-self-center` (equal outer columns ⇒ true centre regardless of logo/actions
  width), cart + account in their own `<ul>` `justify-self-end`. The actions used to be a
  `<div>` inside the links `<ul>` (invalid HTML) pushing everything right.
- Mobile (< md) unchanged: logo left, hamburger + cart right.

Verified at 1280 px: overlap 0 px, links centre offset 0 px, actions 24 px from the right
edge; /salons, /selfcare-products, /ContactUs, /cart all 0 px overlap; 375 px OK.
`/Vendor` has its own fixed navbar with `mt-16` on its hero — left as is.
