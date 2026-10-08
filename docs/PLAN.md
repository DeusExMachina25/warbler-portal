# Product plan

The living plan is a Claude Doc: https://claude.ai/code/artifact/0577fa8f-e0b5-4755-bb8e-02f63d5a3155

## Decisions so far (8 Oct 2026)

- Build the full MVP before the first pilot event.
- The organiser pays for the water per bottle; advertisers pay for panels on the bottle.
- One advertiser per bottle in the MVP, with room in the data model for co-branding later.
- No organiser login in the MVP; the admin creates events.
- Brand name is a placeholder ("Warbler"), kept in `src/config/brand.ts`.
- No domain yet. One must be bought before any QR code is printed.

## Build steps

1. **Foundations:** repo, Supabase, Vercel, magic-link sign-in, empty pages.
2. **Admin console:** packaging formats, ad slots, events and rate cards.
3. **Advertiser booking:** event catalogue, quote, booking, artwork upload and approval, order status.
4. **QR codes and scan counts:** short links, QR images, scan counter, manual payment record.
5. **Pilot events:** 2 to 3 real Hyderabad events through the portal.
