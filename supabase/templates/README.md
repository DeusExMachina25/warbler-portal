# Email templates

Supabase doesn't read these files. They are the source of truth for what to
paste into **Supabase > Authentication > Emails**, so the wording and links
are reviewed like code.

| Supabase template | File | Subject |
| --- | --- | --- |
| Magic Link | `magic-link.html` | Your sign-in link |
| Confirm signup | `confirm-signup.html` | Confirm your email |

Both links point at `/auth/confirm` with a one-time `token_hash`. That route
checks the token with Supabase, so the link works on any device, unlike
Supabase's default `{{ .ConfirmationURL }}` link, which only works in the
browser that asked for it.
