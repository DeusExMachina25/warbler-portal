# Warbler Portal

The advertiser and event portal for a branded event-water business. Companies book ad space on the bottles handed out at an event, upload their artwork, and see how many attendees scanned the QR code on the bottle.

"Warbler" is a placeholder brand name. Change it in [`src/config/brand.ts`](src/config/brand.ts).

The full product plan, with MVP and later features, is in [`docs/PLAN.md`](docs/PLAN.md).

## Tech stack

| Part | Tool | What it does |
| --- | --- | --- |
| Website | [Next.js](https://nextjs.org) 15 with TypeScript | Pages, forms and server code in one app |
| Styling | [Tailwind CSS](https://tailwindcss.com) | Utility classes for layout and colour |
| Database, login, files | [Supabase](https://supabase.com) | Postgres database, magic-link sign-in, file storage |
| Hosting | [Vercel](https://vercel.com) | Builds and hosts the site; a preview link for every pull request |
| Tests | [Vitest](https://vitest.dev) | Small automated checks that run on every pull request |

## Run it on your computer

You need [Node.js 22](https://nodejs.org) and a free Supabase project.

1. Install the packages:
   ```bash
   npm install
   ```
2. Copy the settings template and fill in your Supabase URL and key (Supabase dashboard > Project Settings > API):
   ```bash
   cp .env.example .env.local
   ```
3. Create the database tables. In the Supabase dashboard, open the SQL editor and run each file in `supabase/migrations/` in order. (Later we will switch to the Supabase CLI, which does this with one command.)
4. In Supabase > Authentication > URL Configuration, add `http://localhost:3000/**` as a redirect URL.
   In Supabase > Authentication > Emails, paste in the two templates from `supabase/templates/`.
5. Start the site:
   ```bash
   npm run dev
   ```
   and open http://localhost:3000.

### Make yourself an admin

Sign in once with your email, then run this in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Put it online (Vercel)

1. On [vercel.com/new](https://vercel.com/new), import the `warbler-portal` GitHub repository.
2. Before deploying, add two environment variables (Supabase > Project Settings > API):
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. In Supabase > Authentication > URL Configuration, set the Site URL to your Vercel address and add
   `https://*-<your-vercel-account>.vercel.app/**` (for this project: `https://*-sdzrdy-gmailcoms-projects.vercel.app/**`) to the redirect URLs, so sign-in links work on preview links too.
   Never allow all of `*.vercel.app`: anyone can host a site there.
4. In Supabase > Authentication > Emails, paste in the two templates from `supabase/templates/` (see the README there).

## Useful commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the site locally and reloads on every save |
| `npm run lint` | Checks the code for common mistakes |
| `npm run typecheck` | Checks that data types line up |
| `npm test` | Runs the automated tests |
| `npm run build` | Builds the production version, as Vercel does |

## Folder map

```
src/
  app/                 One folder per web address
    (public)/          Home, events list, sign-in (anyone can see)
    (advertiser)/      Advertiser dashboard (signed-in users)
    admin/             Admin console (admins only)
    auth/              Sign-in link handler and sign-out
  components/          Reusable pieces of UI
  config/brand.ts      Brand name and tagline, in one place
  lib/
    supabase/          Database connection helpers
    auth/              Who is signed in, and where they may go
supabase/migrations/   SQL files that create and change tables, in order
tests/                 Automated checks
docs/                  Plan and decision notes
```

## How we work

1. Every change goes on its own branch and is merged through a pull request. `main` always matches the live site.
2. Secrets live only in `.env.local` and in Vercel's settings, never in git.
3. Database changes are new files in `supabase/migrations/`, never hand edits in the dashboard.
4. Each rule lives in one place (for example the brand name in `src/config/brand.ts`).
