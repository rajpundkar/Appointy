# Contributing to Appointy

Thanks for your interest! This is a young project — feedback, bug reports, and PRs all welcome.

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/appointy.git
cd appointy
cp .env.example .env.local
# Fill in at minimum: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, SESSION_SECRET, RESEND_API_KEY
npm install
npm run dev
```

Open <http://localhost:3000>. Sign up — if SMTP isn't set, the verify-pending page shows you a one-click manual verification link.

## Project layout

```
app/
  page.tsx                          marketing homepage
  [username]/                       public profile + booking flow
  admin/                            authenticated dashboard
  api/                              route handlers (bookings, auth, integrations, …)
lib/
  db.ts            All DB access. Schema auto-migrates in ensureSchema().
  auth.ts          Sessions, signup, verification
  mail.ts          Resend wrapper + email templates
  integrations.ts  Google Calendar (Meet) + MS Graph (Teams)
  availability.ts  Slot generation from weekday rules
  plan.ts          Plan gating (free vs pro)
  types.ts         Shared TS types
```

## Conventions

- **No new colors.** Stick to the design tokens in `app/globals.css` — black surfaces, white accents, status colors only when needed.
- **Multi-tenant by default.** Every query that touches per-user data takes `userId` (or `orgId`). Never trust client-supplied IDs.
- **Validate input with Zod.** Every `POST` route uses `Schema.safeParse(...)`.
- **No silent failures.** Email sends return `{ ok, error? }`. Booking link creation returns `{ link, error? }`. Bubble errors up to the UI.
- **No new dependencies without discussion.** Smaller surface = fewer security holes.

## Submitting a PR

1. Fork → branch (`fix/...` or `feat/...`)
2. Run `npm run lint` + `npm run build` locally
3. Open the PR with a clear "what & why" — screenshots if it's UI
4. One feature/fix per PR

## Reporting bugs

Open an issue with:
- What you did
- What you expected
- What happened (logs / screenshots help)
- `npm run dev` console output if there's a server error

## License

By contributing you agree your contributions are licensed under [AGPL-3.0](./LICENSE).
