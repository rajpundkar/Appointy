# Appointy

> Open-source, minimal scheduling. Booking pages, real availability, team meetings — yours to host.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-black.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Turso](https://img.shields.io/badge/Database-Turso-black)](https://turso.tech)

Hosted version: **[appointy.xyz](https://appointy.xyz)**

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local development](#local-development)
  - [1. Clone & install](#1-clone--install)
  - [2. Turso database](#2-turso-database)
  - [3. Resend (email)](#3-resend-email)
  - [4. Google Meet (optional)](#4-google-meet-optional)
  - [5. Run](#5-run)
- [Project layout](#project-layout)
- [Database schema](#database-schema)
- [Deploy to Vercel](#deploy-to-vercel)
  - [1. Push to GitHub](#1-push-to-github)
  - [2. Import the repo](#2-import-the-repo)
  - [3. Custom domain](#3-custom-domain)
  - [4. Environment variables](#4-environment-variables)
  - [5. OAuth redirect URIs](#5-oauth-redirect-uris)
  - [6. Deploy & test](#6-deploy--test)
- [Operations](#operations)
  - [Database admin](#database-admin)
  - [Plan switching](#plan-switching-free--organization)
  - [Email troubleshooting](#email-troubleshooting)
- [Architecture decisions](#architecture-decisions)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 🗓 Polished public booking pages with **real per-host availability**
- 📝 **Host-editable form questions** (text, long-text, select, file upload) per event type
- 📎 **File upload** in booking forms — up to 5 MB, attached to host's confirmation email
- 🎥 Auto-generated **Google Meet** links per booking (Microsoft Teams & Zoom — coming soon)
- 📬 Transactional email via **Resend**
- 👥 **Organizations** with role-based access (`owner` / `admin` / `member`)
- 🔗 **Email & link invites** with revoke + 14-day expiry
- 🤝 **Team-internal booking** — logged-in teammates auto-prefill + see a context banner
- 🔁 **Password reset** flow with 2-hour single-use tokens
- ✉️ **Email verification** gate before dashboard access
- 🗄 **Turso (libSQL)** with auto-migrating schema — zero migration scripts
- 🎨 Pure **black + white minimal** aesthetic
- 🔓 **AGPL-3.0** — host it, fork it, ship it

## Tech stack

| Layer | Tech |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| UI | **React 19** + TypeScript 6 |
| Database | **Turso** (libSQL) via `@libsql/client` |
| Auth | Server-side sessions in DB + bcryptjs + httpOnly cookies |
| Email | **Resend** |
| Calendar / Meet | `googleapis` (Calendar v3 + OAuth2) |
| Validation | `zod@4` |
| Time / date | `date-fns@4` |
| Icons | `lucide-react@1` |

---

## Prerequisites

- **Node.js 20+** ([nodejs.org](https://nodejs.org))
- **npm** (ships with Node)
- A free **Turso** account ([turso.tech](https://turso.tech))
- A free **Resend** account ([resend.com](https://resend.com))
- *(Optional)* Google Cloud project for Meet links
- *(Optional, recommended)* A custom domain for Resend domain verification

## Local development

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/appointy.git
cd appointy
npm install
cp .env.example .env.local
```

### 2. Turso database

Install the Turso CLI: <https://docs.turso.tech/cli/installation>

```bash
turso auth signup
turso db create appointy
turso db show appointy --url           # → libsql://… (copy)
turso db tokens create appointy        # → long token (copy)
```

Paste both into `.env.local`:

```env
TURSO_DATABASE_URL=libsql://appointy-YOUR_ORG.turso.io
TURSO_AUTH_TOKEN=<paste>
```

The schema is created automatically the first time the app queries the DB — no migration commands.

### 3. Resend (email)

1. Sign up at <https://resend.com>.
2. Create an API key: <https://resend.com/api-keys>.
3. Paste it into `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. *(Optional but recommended)* Verify a domain you own:
   - Resend → Domains → Add domain (e.g. `appointy.xyz`).
   - Add the DKIM, SPF, and DMARC TXT records they show you at your DNS host.
   - Once verified, set:
     ```env
     RESEND_FROM="Appointy <hello@appointy.xyz>"
     ```
   - Until you do this, Resend's test mode will **only deliver to your Resend-account email**. Sign-up verification will fail silently for any other address — the `/verify-pending` page falls back to showing a one-click manual verification link.

### 4. Google Meet (optional)

Without these env vars set, the `Google Meet` option in the booking form will still let users select it but the link won't auto-generate (host will get a "couldn't generate" warning in admin).

To enable:

1. Go to <https://console.cloud.google.com>.
2. Create a project (or pick existing).
3. **APIs & Services → Library → search "Google Calendar API" → Enable.**
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Authorized redirect URI: `http://localhost:3000/api/integrations/google/callback`
5. Copy the Client ID and Secret into `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=…
   GOOGLE_CLIENT_SECRET=…
   ```

### 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

1. Click **Get started → free** → sign up with your email + a workspace name.
2. Check your inbox for the verification email (or use the manual link on `/verify-pending` if email isn't configured).
3. After verifying, you're in the admin.
4. Visit `/<your-username>` in another tab to see your booking page.

---

## Project layout

```
app/
  page.tsx                          marketing homepage
  signup/  login/  verify/          public auth pages
  verify-pending/                   hard-gate page (unverified users)
  forgot-password/  reset-password/ password recovery
  invite/[token]/                   accept-invite page
  [username]/                       public profile listing event types
  [username]/[eventType]/           date → time → form → confirm
  admin/                            authenticated dashboard
    page.tsx                          overview + upcoming bookings
    meetings/                         calendar + table views
    event-types/                      CRUD + form question editor
    availability/                     per-weekday windows
    integrations/                     Google Meet (Teams/Zoom coming soon)
    team/                             org members + invite UI (Pro)
    billing/                          plan switcher
    settings/                         profile + organization
  api/
    auth/                             signup, login, logout, verify, resend, accept-invite,
                                      forgot-password, reset-password
    bookings/                         POST create, [id]/retry-link POST
    event-types/                      CRUD; [id]/questions PUT/GET
    availability/                     GET/PUT
    invites/                          POST create, [token] DELETE
    integrations/google/(callback)    OAuth flow
    billing/toggle/                   dev-mode plan switcher
lib/
  db.ts            All DB access. Schema auto-migrates in ensureSchema()
  auth.ts          Sessions, signup, verification, password reset
  mail.ts          Resend wrapper + email templates
  integrations.ts  Google Calendar (Meet) + OAuth helpers
  availability.ts  Slot generation from weekday rules
  plan.ts          Plan gating (free vs pro)
  time.ts          Slot date helpers
  types.ts         Shared TypeScript types
public/
  logo.png
app/icon.png       favicon (Next.js convention)
```

## Database schema

All tables are created/migrated automatically on first DB query via `ensureSchema()` in `lib/db.ts`. No migration scripts to run.

| Table | Purpose |
|---|---|
| `orgs` | Tenants — created on signup. `plan` column toggles Free/Pro. |
| `users` | Members of an org. `role` is owner/admin/member. `email_verified` gates dashboard access. |
| `sessions` | Server-side sessions, bound to httpOnly cookie `appointy_session`. |
| `verification_tokens` | Dual-purpose: `email_verify` and `password_reset`. Single-use, TTL'd. |
| `event_types` | Bookable durations per user. Seeded with 3 defaults on signup. |
| `event_questions` | Host-editable form questions per event type. |
| `availability` | Weekly recurring windows per user. Seeded Mon–Fri 9–5 on signup. |
| `bookings` | All booking records. Includes `answers_json` + `attachments_json`. |
| `integrations` | OAuth tokens per (user, provider). Refresh-token rotation handled. |
| `invites` | Org join links. 14-day TTL, `used` flag prevents replay. |

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/appointy.git
git push -u origin main
```

### 2. Import the repo

1. Go to <https://vercel.com/new>.
2. Pick the `appointy` repo.
3. Framework preset auto-detects as **Next.js**.
4. Click **Deploy** (it'll fail on first run because env vars aren't set — that's fine, we set them next).

### 3. Custom domain

In Vercel → Project → **Domains**:

1. Add `appointy.xyz` and `www.appointy.xyz`.
2. Vercel shows DNS records — add them at your registrar (A record for apex, CNAME for `www`).
3. Wait for SSL provisioning (a few minutes).

### 4. Environment variables

Vercel → Project → **Settings → Environment Variables**:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://appointy.xyz` (no trailing slash) |
| `SESSION_SECRET` | ✅ | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `TURSO_DATABASE_URL` | ✅ | From Turso |
| `TURSO_AUTH_TOKEN` | ✅ | From Turso |
| `RESEND_API_KEY` | ✅ | From Resend |
| `RESEND_FROM` | ✅ | `Appointy <hello@appointy.xyz>` (after domain verified) |
| `GOOGLE_CLIENT_ID` | optional | For Meet links |
| `GOOGLE_CLIENT_SECRET` | optional | For Meet links |

Apply each variable to **Production** + **Preview** (and **Development** if you use Vercel CLI locally).

### 5. OAuth redirect URIs

Update your Google Cloud Console OAuth client:

- **Authorized redirect URIs**: `https://appointy.xyz/api/integrations/google/callback`
- Also keep `http://localhost:3000/api/integrations/google/callback` if you want local dev to still work.

### 6. Deploy & test

Either push a new commit or hit **Redeploy** in Vercel. After deploy:

1. Visit `https://appointy.xyz`.
2. Sign up → verify email → land in admin.
3. Visit `https://appointy.xyz/<your-username>` in incognito → confirm public booking page works.
4. Make a test booking — confirm both confirmation emails arrive.
5. In admin → Integrations → connect Google → make another booking → confirm the Meet link appears.

Future commits to `main` auto-deploy. Pull requests get unique preview URLs.

---

## Operations

### Database admin

Wipe everything (nuclear):

```sql
PRAGMA foreign_keys = OFF;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS integrations;
DROP TABLE IF EXISTS availability;
DROP TABLE IF EXISTS event_questions;
DROP TABLE IF EXISTS event_types;
DROP TABLE IF EXISTS verification_tokens;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS invites;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS orgs;
PRAGMA foreign_keys = ON;
```

Run via `turso db shell appointy`. The app re-creates the schema on the next request.

Wipe data but keep schema: replace each `DROP TABLE` with `DELETE FROM`.

Reset a single user:

```sql
DELETE FROM users WHERE email = 'you@example.com';
DELETE FROM orgs WHERE id NOT IN (SELECT DISTINCT org_id FROM users);
```

### Plan switching (Free / Organization)

The Org Plan (paid) is currently dev-toggleable — Stripe is not wired in yet. Owner of an org can flip it at **Admin → Billing → Upgrade**. Replace the contents of `app/api/billing/toggle/route.ts` with a Stripe webhook when you're ready.

### Email troubleshooting

If signups don't receive verification email:

1. Check `RESEND_API_KEY` is set in Vercel for the correct environment.
2. If `RESEND_FROM` uses `onboarding@resend.dev`, Resend only delivers to your own Resend-account email. Verify your domain (see [Resend setup](#3-resend-email)).
3. Check Vercel function logs for `[mail:verify] failed → …` lines.
4. As a fallback, `/verify-pending` shows a one-click manual link if the email send fails.

---

## Architecture decisions

- **Server-side sessions** (not JWT). Storing sessions in DB lets us instantly invalidate all sessions on password reset and revoke specific sessions. Cookie is httpOnly + SameSite=lax + secure in prod.
- **Schema auto-migrates** in `lib/db.ts` `ensureSchema()`. Uses `CREATE TABLE IF NOT EXISTS` + idempotent `ALTER TABLE ADD COLUMN` wrapped in try/catch. This trades migration tooling for zero-ops simplicity at this scale.
- **Multi-tenant by row, not by schema**. Every per-user query takes `userId` (or `orgId`). No row-level security in libSQL — enforced in the app layer.
- **File uploads stored inline as base64** in `bookings.attachments_json` (5 MB cap). Swap for object storage when you outgrow this.
- **Token format**: 64-char hex (two `crypto.randomUUID()` joined). Used for sessions, verification, password reset, and invites. Single-use where appropriate.
- **Account enumeration**: `/api/auth/forgot-password` always returns `{ ok: true }` regardless of whether the email matches an account.

## Roadmap

- Microsoft Teams + Zoom integrations
- Apple Calendar / iCal feeds
- Webhooks on booking create/cancel
- Booking cancellation + reschedule flows for guests
- Recurring availability overrides (one-off blocked dates)
- Stripe billing for the Organization plan
- Booking page customisation (host bio, social links, custom theme)

## Contributing

Issues and PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[AGPL-3.0](./LICENSE) © Appointy contributors.

> **What this means for you:** You can self-host, modify, and use Appointy freely.
> If you run a modified version as a service for others, you must publish your
> changes under AGPL-3.0. This protects the project from being repackaged and
> resold without contributing back.
