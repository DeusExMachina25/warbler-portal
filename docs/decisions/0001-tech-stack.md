# 0001: Next.js, Supabase and Vercel

Date: 8 Oct 2026

## Decision

One Next.js (TypeScript) app hosted on Vercel, with Supabase for the database, sign-in and file storage.

## Why

- One app is easier to learn and deploy than separate front-end and back-end projects.
- Supabase covers three needs in one service, and Row Level Security keeps each advertiser's data private inside the database itself.
- Vercel gives a preview link for every pull request, so changes can be clicked through before they go live.
- v0 generates Next.js and Tailwind code, so its drafts drop straight into this repo.

## Trade-offs

- We depend on two hosted services. Both have free tiers for building; paid plans are needed for the live business.
- Next.js 15 is used rather than 16 to stay on the version most guides and v0 output target. `npm audit` reports advisories in the PostCSS copy bundled inside Next.js 15 (build-time CSS processing); we will move to Next.js 16 in a later step.
