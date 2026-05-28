# Appointy

> Open-source, minimal scheduling. Booking pages, real availability, custom forms — yours to host.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-black.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)

Live at **[appointy.xyz](https://appointy.xyz)**.

---

## Features

- 🗓 Public booking pages with **real per-host availability**
- 📝 **Host-editable form questions** per event type (text, long-text, select, file upload)
- 📎 **File upload** in booking forms — up to 5 MB, attached to host's confirmation email
- 🎥 Auto-generated **Google Meet** links per booking (Teams & Zoom coming soon)
- 📬 Transactional email via **Resend**
- 👥 **Organizations** with role-based access — `owner` / `admin` / `member`
- 🔗 **Email & link invites** with revoke + 14-day expiry
- 🤝 **Team-internal booking** — logged-in teammates auto-prefill
- 🔁 **Password reset** with 2-hour single-use tokens
- ✉️ **Email verification** gate before dashboard access
- 🗄 **Turso (libSQL)** with auto-migrating schema — zero migration scripts

## Tech stack

Next.js 16 · React 19 · TypeScript · Turso (libSQL) · Resend · googleapis · zod · date-fns · bcryptjs

## Getting started

### Prerequisites

- Node.js 20+
- A free [Turso](https://turso.tech) account
- A free [Resend](https://resend.com) account

### Setup

```bash
git clone https://github.com/rajpundkar/Appointy.git
cd Appointy
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_SECRET=<random hex; node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=<from turso>

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM="Appointy <hello@yourdomain.com>"

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Create the Turso database:

```bash
turso db create appointy
turso db show appointy --url
turso db tokens create appointy
```

The schema is created automatically on first request — no migrations to run.

### Run

```bash
npm run dev
```

Open <http://localhost:3000>, sign up, verify your email, and visit `/<your-username>` to see your booking page.

## Project structure

```
app/                  Next.js App Router — public + admin pages + API routes
  page.tsx              Marketing homepage
  [username]/           Public profile + booking flow
  admin/                Authenticated dashboard
  api/                  Route handlers
lib/
  db.ts                 All DB access; schema auto-migrates in ensureSchema()
  auth.ts               Sessions, signup, password reset
  mail.ts               Resend client + email templates
  integrations.ts       Google Calendar (Meet) OAuth helpers
  availability.ts       Slot generation
  plan.ts               Free / Organization plan gating
  types.ts              Shared TypeScript types
public/logo.png
```

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[AGPL-3.0](./LICENSE) © Appointy contributors.
