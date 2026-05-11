@AGENTS.md

# SkillForge VN project notes

## Product direction

- This project is a single-creator storefront for SkillForge VN, not an AI skill generator.
- The site sells and showcases 4 product kinds through one unified product model:
  - `tool`: desktop `.exe` tools built by the owner, usually Python + Playwright + CustomTkinter + PyInstaller.
  - `setup`: done-for-you setup services for non-IT users, e.g. MCP, OpenClaw, FX API, Claude Code, AI plugins.
  - `course`: AI basic courses/classes delivered as Drive folders, videos, PDFs, and support channels.
  - `webwork`: custom landing pages, portfolio sites, and CV online work.
- Customers do not pay automatically in the MVP. They view product details and submit a contact/inquiry form; the owner follows up manually through Zalo/Telegram/email/Drive.
- Every public product can have a YouTube demo URL. Use lazy YouTube embedding and avoid loading iframes until needed.

## Current routes

- Public pages:
  - `/`
  - `/tools`, `/tools/[slug]`
  - `/setup`, `/setup/[slug]`
  - `/courses`, `/courses/[slug]`
  - `/web`, `/web/[slug]`
  - `/contact`, `/thanks`, `/login`, `/signup`, `/about`, `/process`, `/legal/privacy`, `/legal/terms`
- Admin pages:
  - `/admin`
  - `/admin/products`
  - `/admin/products/new`
  - `/admin/products/[id]/edit`
  - `/admin/inquiries`
- API routes:
  - `POST /api/inquiries`
  - `POST /api/admin/products`
  - `PATCH /api/admin/products/[id]`
  - `DELETE /api/admin/products/[id]`
  - `PATCH /api/admin/inquiries/[id]`

## Database and Supabase

- Supabase schema lives in `supabase/schema.sql`.
- The main tables are:
  - `products`: all sellable/showcase items across the 4 kinds.
  - `inquiries`: customer contact requests linked to `product_id` and `product_kind`.
- `inquiries` is for leads/customer requests. Status values are `new`, `contacted`, and `closed`.
- The schema is intended to be runnable from a fresh Supabase database. Do not add `drop policy ... on products` before creating/checking the table, because that fails when the relation does not exist. Prefer `drop table if exists ... cascade` for local/MVP reset scripts.
- Admin identity is controlled by `ADMIN_EMAIL` in `.env.local` and checked server-side.
- Required local env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_EMAIL`
- Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY`.

## Next.js 16 notes

- This app uses Next.js 16.2.5 App Router with Turbopack.
- Read relevant local docs in `node_modules/next/dist/docs/` before writing Next-specific code when unsure.
- In App Router pages, `params` and `searchParams` are promises; await them in server components.
- Client components that call `useSearchParams()` must be wrapped in a `Suspense` boundary, otherwise production build can fail.
- The old `src/middleware.ts` convention is deprecated here. Use `src/proxy.ts` and export `proxy(request: NextRequest)` with `config.matcher`.

## Implementation conventions

- Use `src/lib/product-types.ts` as the shared product-kind source of truth. Avoid recreating kind labels/routes/icons in multiple files.
- Use the unified `products` table and `Product` type; do not reintroduce `tools` table, `tool-types`, `tool-card`, or `tool_id` references.
- Product slugs are lowercase URL identifiers, e.g. `mockup-automation`, `setup-mcp-cho-non-it`, `khoa-hoc-ai-co-ban`.
- Admin product creation/editing should use `/admin/products` and kind-aware form logic.
- Contact flow should pass both product slug and kind when possible: `/contact?product=<slug>&kind=<kind>`.
- Public product details should route through kind-specific paths, not a generic `/products/[slug]` page.

## Verification commands

Run these before considering the project healthy:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

To run locally:

```bash
npm run dev
```

If port 3000 is occupied, Next may start on port 3001 or another available port.
