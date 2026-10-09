# Oriel web

Marketing site and waitlist for Oriel. Next.js (App Router) on Vercel, with Supabase for waitlist storage.

## Quick start

1. `npm install`, then commit `package-lock.json`. CI uses `npm ci` once the lockfile is committed.
2. Create a Supabase project. In the SQL editor, run `supabase/migrations/0001_waitlist.sql`.
3. `cp .env.example .env.local` and fill in `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
4. `npm run dev`, then open http://localhost:3000.

## Deploy

1. Push this repository to GitHub.
2. In Vercel, import the repository. The framework preset is Next.js.
3. Add `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SITE_URL` (no trailing slash) for Production and Preview.
4. Deploy. Pushes to `main` ship to production, and pull requests get preview URLs.

Vercel's Hobby plan is for non-commercial use, so move to a paid plan before charging customers.

## Structure

```
src/app/              routes: home, join, [slug] content pages, 404, sitemap, robots
src/app/join/         waitlist server action (validation, honeypot, Supabase insert)
src/components/       header, footer, waitlist form, animated mark
src/content/pages.ts  copy and layout for marketing pages (edit here)
src/lib/              site config and the server-only Supabase client
supabase/migrations/  database schema and row-level security
```

## Editing content

Add an entry to `src/content/pages.ts`. The route, metadata, and sitemap entry are generated from it.

## Security

- The Supabase key is read on the server only and is never prefixed with `NEXT_PUBLIC_`.
- Row-level security lets anonymous visitors insert waitlist rows but never read them.
- Inputs are validated on the server with zod. A honeypot field catches simple bots.
- Security headers are set in `next.config.mjs`.
- Email addresses are never written to logs.
