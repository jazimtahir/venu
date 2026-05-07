# Venue – Event Venue Marketplace MVP (Pakistan)

An event venue marketplace built with Next.js (App Router), TypeScript, TailwindCSS, and Supabase. Focused on weddings and beyond. Deploy-ready for Vercel.

## Features

- **Auth:** Customer, vendor, and admin roles (Supabase Auth + `profiles` table)
- **Venues:** List, filter by city/budget/capacity/type/features, sort; venue detail with gallery, map, inquiry form
- **Vendor dashboard:** Create/edit venues, upload images (Supabase Storage), manage features, view inquiries
- **Customer dashboard:** View submitted inquiries, edit profile
- **Admin:** View venues/vendors/inquiries, verify vendors, feature venues, delete spam inquiries
- **SEO:** Dynamic meta titles, sitemap, robots.txt, JSON-LD (EventVenue) on venue pages

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- TailwindCSS v4
- Supabase (Postgres, Auth, Storage)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd venue
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Settings → API**: copy **Project URL** and **anon public** key.

### 3. Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: inquiry email to admin (Resend)
RESEND_API_KEY=re_xxxx
ADMIN_EMAIL=admin@example.com

# Production: canonical URL for sitemap/OG
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 4. Database schema

In Supabase **SQL Editor**, run in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_inquiries_user_id.sql`

### 5. Storage bucket

In Supabase **Storage**:

1. Create a bucket named **venue-images**.
2. Set it to **Public** (or keep private and use signed URLs; the app uses public URLs).
3. Under **Policies**, add:
   - **Allow public read** for `SELECT`.
   - **Allow authenticated upload** for `INSERT` (e.g. `auth.role() = 'authenticated'` and path prefix `*` or restrict by folder).

### 6. Create an admin user

After signing up a user, set their role to admin in Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';
```

### 7. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add the same environment variables in **Project → Settings → Environment Variables**.
3. Deploy. Optionally use Supabase’s **connection pooler** URL for serverless if you hit connection limits.

## Project structure

- `src/app/` – Routes (landing, venues, venue/[slug], city/[city], compare, login, register, dashboard, vendor/dashboard, admin)
- `src/components/` – UI, layout, venue cards, filters, inquiry form
- `src/lib/` – Supabase client/server, venue query helpers
- `src/app/actions/` – Server actions (auth, venue CRUD, inquiry, admin)
- `src/types/` – Database/TS types
- `src/utils/` – Constants, slug, etc.
- `supabase/migrations/` – SQL schema and RLS

## Phased build summary

| Phase | Delivered |
|-------|-----------|
| 1 | SQL schema, RLS, Supabase client/server, Auth, middleware, landing (hero, search, featured, CTA) |
| 2 | Venue CRUD (vendor), list/city filtering, venue detail (gallery, map, features, inquiry form, similar venues) |
| 3 | Inquiry DB + email (Resend), customer dashboard (inquiries, profile), vendor dashboard (venues + inquiries), admin (venues, verify, featured, inquiries) |
| 4 | SEO (metadata, sitemap, robots, JSON-LD), performance (server components, image config) |

## License

Private / use as needed.
