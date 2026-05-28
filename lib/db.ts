import { createClient, type Client } from "@libsql/client";
import type { Attachment, AvailabilityRule, Booking, EventType, Integration, Invite, Org, Plan, Question, QuestionType, Role, User } from "./types";

let _client: Client | null = null;
let _schemaReady: Promise<void> | null = null;

function client(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  _client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return _client;
}

async function ensureSchema() {
  if (_schemaReady) return _schemaReady;
  _schemaReady = (async () => {
    const c = client();
    await c.batch(
      [
        `CREATE TABLE IF NOT EXISTS orgs (
           id TEXT PRIMARY KEY,
           name TEXT NOT NULL,
           slug TEXT NOT NULL UNIQUE,
           created_at TEXT NOT NULL
         )`,
        `CREATE TABLE IF NOT EXISTS users (
           id TEXT PRIMARY KEY,
           org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
           name TEXT NOT NULL,
           email TEXT NOT NULL UNIQUE,
           username TEXT NOT NULL UNIQUE,
           password_hash TEXT NOT NULL,
           role TEXT NOT NULL DEFAULT 'member',
           timezone TEXT NOT NULL DEFAULT 'UTC',
           bio TEXT,
           email_verified INTEGER NOT NULL DEFAULT 0,
           created_at TEXT NOT NULL
         )`,
        `CREATE TABLE IF NOT EXISTS sessions (
           id TEXT PRIMARY KEY,
           user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
           expires_at TEXT NOT NULL,
           created_at TEXT NOT NULL
         )`,
        `CREATE TABLE IF NOT EXISTS verification_tokens (
           token TEXT PRIMARY KEY,
           user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
           purpose TEXT NOT NULL,
           expires_at TEXT NOT NULL,
           created_at TEXT NOT NULL
         )`,
        `CREATE TABLE IF NOT EXISTS event_types (
           id TEXT PRIMARY KEY,
           user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
           slug TEXT NOT NULL,
           title TEXT NOT NULL,
           duration INTEGER NOT NULL,
           description TEXT,
           active INTEGER NOT NULL DEFAULT 1,
           UNIQUE (user_id, slug)
         )`,
        `CREATE TABLE IF NOT EXISTS availability (
           user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
           weekday INTEGER NOT NULL,
           start_time TEXT NOT NULL,
           end_time TEXT NOT NULL,
           PRIMARY KEY (user_id, weekday, start_time)
         )`,
        `CREATE TABLE IF NOT EXISTS bookings (
           id TEXT PRIMARY KEY,
           user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
           org_id TEXT NOT NULL,
           event_type_id TEXT NOT NULL,
           event_slug TEXT NOT NULL,
           event_title TEXT NOT NULL,
           duration INTEGER NOT NULL,
           starts_at TEXT NOT NULL,
           ends_at TEXT NOT NULL,
           timezone TEXT NOT NULL,
           attendee_name TEXT NOT NULL,
           attendee_email TEXT NOT NULL,
           attendee_phone TEXT,
           attendee_company TEXT,
           purpose TEXT NOT NULL,
           notes TEXT,
           answers_json TEXT,
           attachments_json TEXT,
           location TEXT NOT NULL,
           meeting_link TEXT,
           meeting_link_error TEXT,
           status TEXT NOT NULL DEFAULT 'confirmed',
           created_at TEXT NOT NULL
         )`,
        `CREATE TABLE IF NOT EXISTS integrations (
           user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
           provider TEXT NOT NULL,
           connected INTEGER NOT NULL DEFAULT 0,
           account TEXT,
           access_token TEXT,
           refresh_token TEXT,
           expires_at INTEGER,
           connected_at TEXT,
           PRIMARY KEY (user_id, provider)
         )`,
        `CREATE TABLE IF NOT EXISTS event_questions (
           id TEXT PRIMARY KEY,
           event_type_id TEXT NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
           user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
           ord INTEGER NOT NULL DEFAULT 0,
           label TEXT NOT NULL,
           type TEXT NOT NULL,
           required INTEGER NOT NULL DEFAULT 0,
           options TEXT,
           placeholder TEXT
         )`,
        `CREATE TABLE IF NOT EXISTS invites (
           token TEXT PRIMARY KEY,
           org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
           email TEXT,
           role TEXT NOT NULL DEFAULT 'member',
           expires_at TEXT NOT NULL,
           used INTEGER NOT NULL DEFAULT 0,
           created_at TEXT NOT NULL
         )`,
        `CREATE INDEX IF NOT EXISTS idx_bookings_user_start ON bookings (user_id, starts_at)`,
        `CREATE INDEX IF NOT EXISTS idx_event_types_user ON event_types (user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_event_questions_event ON event_questions (event_type_id, ord)`,
      ],
      "write",
    );

    for (const sql of [
      `ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE bookings ADD COLUMN meeting_link_error TEXT`,
      `ALTER TABLE bookings ADD COLUMN answers_json TEXT`,
      `ALTER TABLE bookings ADD COLUMN attachments_json TEXT`,
      `ALTER TABLE orgs ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'`,
    ]) {
      try { await c.execute(sql); } catch {  }
    }
  })();
  return _schemaReady;
}

export async function q() {
  await ensureSchema();
  return client();
}

type Row = Record<string, unknown>;
const str = (v: unknown): string => (v == null ? "" : String(v));
const opt = (v: unknown): string | undefined => (v == null ? undefined : String(v));
const num = (v: unknown): number => Number(v ?? 0);

const mapOrg = (r: Row): Org => ({
  id: str(r.id), name: str(r.name), slug: str(r.slug),
  plan: (opt(r.plan) as Plan) ?? "free",
  createdAt: str(r.created_at),
});

const mapUser = (r: Row): User => ({
  id: str(r.id),
  orgId: str(r.org_id),
  name: str(r.name),
  email: str(r.email),
  username: str(r.username),
  role: str(r.role) as Role,
  timezone: str(r.timezone),
  bio: opt(r.bio),
  emailVerified: num(r.email_verified) === 1,
  createdAt: str(r.created_at),
});

const mapEvent = (r: Row): EventType => ({
  id: str(r.id),
  userId: str(r.user_id),
  slug: str(r.slug),
  title: str(r.title),
  duration: num(r.duration),
  description: opt(r.description),
  active: num(r.active) === 1,
});

function safeJsonParse<T>(s: string | undefined | null, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

const mapBooking = (r: Row): Booking => ({
  id: str(r.id),
  userId: str(r.user_id),
  orgId: str(r.org_id),
  eventTypeId: str(r.event_type_id),
  eventSlug: str(r.event_slug),
  eventTitle: str(r.event_title),
  duration: num(r.duration),
  startsAt: str(r.starts_at),
  endsAt: str(r.ends_at),
  timezone: str(r.timezone),
  attendee: {
    name: str(r.attendee_name),
    email: str(r.attendee_email),
    phone: opt(r.attendee_phone),
    company: opt(r.attendee_company),
  },
  purpose: str(r.purpose),
  notes: opt(r.notes),
  answers: safeJsonParse<Record<string, string> | undefined>(opt(r.answers_json), undefined),
  attachments: safeJsonParse<Attachment[] | undefined>(opt(r.attachments_json), undefined),
  location: str(r.location) as Booking["location"],
  meetingLink: opt(r.meeting_link),
  meetingLinkError: opt(r.meeting_link_error),
  status: str(r.status) as Booking["status"],
  createdAt: str(r.created_at),
});

const mapIntegration = (r: Row): Integration => ({
  userId: str(r.user_id),
  provider: str(r.provider) as Integration["provider"],
  connected: num(r.connected) === 1,
  account: opt(r.account),
  accessToken: opt(r.access_token),
  refreshToken: opt(r.refresh_token),
  expiresAt: r.expires_at == null ? undefined : Number(r.expires_at),
  connectedAt: opt(r.connected_at),
});

export async function createOrg(input: { name: string; slug: string; plan?: Plan }): Promise<Org> {
  const c = await q();
  const id = `org_${crypto.randomUUID().slice(0, 12)}`;
  const createdAt = new Date().toISOString();
  const plan: Plan = input.plan ?? "free";
  await c.execute({
    sql: `INSERT INTO orgs (id, name, slug, plan, created_at) VALUES (?, ?, ?, ?, ?)`,
    args: [id, input.name, input.slug, plan, createdAt],
  });
  return { id, name: input.name, slug: input.slug, plan, createdAt };
}

export async function setOrgPlan(orgId: string, plan: Plan): Promise<void> {
  const c = await q();
  await c.execute({ sql: `UPDATE orgs SET plan = ? WHERE id = ?`, args: [plan, orgId] });
}

export async function getOrgBySlug(slug: string): Promise<Org | null> {
  const c = await q();
  const r = await c.execute({ sql: `SELECT * FROM orgs WHERE slug = ?`, args: [slug] });
  return r.rows[0] ? mapOrg(r.rows[0] as Row) : null;
}

export async function getOrgById(id: string): Promise<Org | null> {
  const c = await q();
  const r = await c.execute({ sql: `SELECT * FROM orgs WHERE id = ?`, args: [id] });
  return r.rows[0] ? mapOrg(r.rows[0] as Row) : null;
}

export async function createUser(input: {
  orgId: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role?: Role;
  timezone?: string;
}): Promise<User> {
  const c = await q();
  const id = `usr_${crypto.randomUUID().slice(0, 12)}`;
  const createdAt = new Date().toISOString();
  const role = input.role ?? "member";
  const timezone = input.timezone ?? "UTC";
  await c.execute({
    sql: `INSERT INTO users (id, org_id, name, email, username, password_hash, role, timezone, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, input.orgId, input.name, input.email.toLowerCase(), input.username.toLowerCase(), input.passwordHash, role, timezone, createdAt],
  });
  return {
    id, orgId: input.orgId, name: input.name, email: input.email.toLowerCase(),
    username: input.username.toLowerCase(), role, timezone,
    emailVerified: false, createdAt,
  };
}

export async function getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  const c = await q();
  const r = await c.execute({ sql: `SELECT * FROM users WHERE email = ?`, args: [email.toLowerCase()] });
  if (!r.rows[0]) return null;
  const row = r.rows[0] as Row;
  return { ...mapUser(row), passwordHash: str(row.password_hash) };
}

export async function getUserById(id: string): Promise<User | null> {
  const c = await q();
  const r = await c.execute({ sql: `SELECT * FROM users WHERE id = ?`, args: [id] });
  return r.rows[0] ? mapUser(r.rows[0] as Row) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const c = await q();
  const r = await c.execute({ sql: `SELECT * FROM users WHERE username = ?`, args: [username.toLowerCase()] });
  return r.rows[0] ? mapUser(r.rows[0] as Row) : null;
}

export async function listOrgMembers(orgId: string): Promise<User[]> {
  const c = await q();
  const r = await c.execute({ sql: `SELECT * FROM users WHERE org_id = ? ORDER BY created_at`, args: [orgId] });
  return r.rows.map((x) => mapUser(x as Row));
}

export async function markUserVerified(userId: string): Promise<void> {
  const c = await q();
  await c.execute({ sql: `UPDATE users SET email_verified = 1 WHERE id = ?`, args: [userId] });
}

export async function createVerificationToken(userId: string, ttlHours = 48): Promise<string> {
  const c = await q();
  const token = `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
  const expiresAt = new Date(Date.now() + ttlHours * 3600_000).toISOString();
  await c.execute({
    sql: `INSERT INTO verification_tokens (token, user_id, purpose, expires_at, created_at) VALUES (?, ?, 'email_verify', ?, ?)`,
    args: [token, userId, expiresAt, new Date().toISOString()],
  });
  return token;
}

export async function consumeVerificationToken(token: string): Promise<string | null> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT user_id, expires_at FROM verification_tokens WHERE token = ? AND purpose = 'email_verify'`,
    args: [token],
  });
  if (!r.rows[0]) return null;
  const row = r.rows[0] as Row;
  if (new Date(str(row.expires_at)) < new Date()) return null;
  await c.execute({ sql: `DELETE FROM verification_tokens WHERE token = ?`, args: [token] });
  return str(row.user_id);
}

export async function createPasswordResetToken(userId: string, ttlHours = 2): Promise<string> {
  const c = await q();

  await c.execute({
    sql: `DELETE FROM verification_tokens WHERE user_id = ? AND purpose = 'password_reset'`,
    args: [userId],
  });
  const token = `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
  const expiresAt = new Date(Date.now() + ttlHours * 3600_000).toISOString();
  await c.execute({
    sql: `INSERT INTO verification_tokens (token, user_id, purpose, expires_at, created_at) VALUES (?, ?, 'password_reset', ?, ?)`,
    args: [token, userId, expiresAt, new Date().toISOString()],
  });
  return token;
}

export async function peekPasswordResetToken(token: string): Promise<string | null> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT user_id, expires_at FROM verification_tokens WHERE token = ? AND purpose = 'password_reset'`,
    args: [token],
  });
  if (!r.rows[0]) return null;
  const row = r.rows[0] as Row;
  if (new Date(str(row.expires_at)) < new Date()) return null;
  return str(row.user_id);
}

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT user_id, expires_at FROM verification_tokens WHERE token = ? AND purpose = 'password_reset'`,
    args: [token],
  });
  if (!r.rows[0]) return null;
  const row = r.rows[0] as Row;
  if (new Date(str(row.expires_at)) < new Date()) return null;
  await c.execute({ sql: `DELETE FROM verification_tokens WHERE token = ?`, args: [token] });
  return str(row.user_id);
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  const c = await q();
  await c.execute({
    sql: `UPDATE users SET password_hash = ? WHERE id = ?`,
    args: [passwordHash, userId],
  });
}

export async function deleteAllSessionsForUser(userId: string): Promise<void> {
  const c = await q();
  await c.execute({
    sql: `DELETE FROM sessions WHERE user_id = ?`,
    args: [userId],
  });
}

export async function createSession(userId: string, ttlDays = 30): Promise<{ id: string; expiresAt: string }> {
  const c = await q();
  const id = `sess_${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
  const expiresAt = new Date(Date.now() + ttlDays * 86400_000).toISOString();
  await c.execute({
    sql: `INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
    args: [id, userId, expiresAt, new Date().toISOString()],
  });
  return { id, expiresAt };
}

export async function getSessionUser(sessionId: string): Promise<User | null> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.id = ? AND s.expires_at > ?`,
    args: [sessionId, new Date().toISOString()],
  });
  return r.rows[0] ? mapUser(r.rows[0] as Row) : null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const c = await q();
  await c.execute({ sql: `DELETE FROM sessions WHERE id = ?`, args: [sessionId] });
}

const DEFAULT_EVENTS: Omit<EventType, "id" | "userId">[] = [
  { slug: "15min", title: "15 Min Meeting", duration: 15, description: "Quick chat — get to know each other.", active: true },
  { slug: "30min", title: "30 Min Meeting", duration: 30, description: "Standard intro / project discussion.", active: true },
  { slug: "60min", title: "60 Min Deep Dive", duration: 60, description: "Detailed working session.", active: true },
];

export async function seedDefaultEvents(userId: string): Promise<void> {
  const c = await q();
  for (const e of DEFAULT_EVENTS) {
    await c.execute({
      sql: `INSERT INTO event_types (id, user_id, slug, title, duration, description, active)
            VALUES (?, ?, ?, ?, ?, ?, 1)`,
      args: [`evt_${crypto.randomUUID().slice(0, 12)}`, userId, e.slug, e.title, e.duration, e.description ?? null],
    });
  }
}

export async function listEventTypes(userId: string): Promise<EventType[]> {
  const c = await q();
  const r = await c.execute({ sql: `SELECT * FROM event_types WHERE user_id = ? ORDER BY duration`, args: [userId] });
  return r.rows.map((x) => mapEvent(x as Row));
}

export async function getEventType(userId: string, slug: string): Promise<EventType | null> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT * FROM event_types WHERE user_id = ? AND slug = ?`,
    args: [userId, slug],
  });
  return r.rows[0] ? mapEvent(r.rows[0] as Row) : null;
}

export async function getEventTypeById(userId: string, id: string): Promise<EventType | null> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT * FROM event_types WHERE id = ? AND user_id = ?`,
    args: [id, userId],
  });
  return r.rows[0] ? mapEvent(r.rows[0] as Row) : null;
}

export async function createEventType(userId: string, input: Omit<EventType, "id" | "userId">): Promise<EventType> {
  const c = await q();
  const id = `evt_${crypto.randomUUID().slice(0, 12)}`;
  await c.execute({
    sql: `INSERT INTO event_types (id, user_id, slug, title, duration, description, active)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, userId, input.slug, input.title, input.duration, input.description ?? null, input.active ? 1 : 0],
  });
  return { ...input, id, userId };
}

export async function updateEventType(userId: string, id: string, patch: Partial<Omit<EventType, "id" | "userId">>): Promise<void> {
  const c = await q();
  const fields: string[] = []; const args: (string | number | null)[] = [];
  if (patch.slug !== undefined) { fields.push("slug = ?"); args.push(patch.slug); }
  if (patch.title !== undefined) { fields.push("title = ?"); args.push(patch.title); }
  if (patch.duration !== undefined) { fields.push("duration = ?"); args.push(patch.duration); }
  if (patch.description !== undefined) { fields.push("description = ?"); args.push(patch.description ?? null); }
  if (patch.active !== undefined) { fields.push("active = ?"); args.push(patch.active ? 1 : 0); }
  if (!fields.length) return;
  args.push(id, userId);
  await c.execute({ sql: `UPDATE event_types SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`, args });
}

export async function deleteEventType(userId: string, id: string): Promise<void> {
  const c = await q();
  await c.execute({ sql: `DELETE FROM event_types WHERE id = ? AND user_id = ?`, args: [id, userId] });
}

const DEFAULT_AVAILABILITY: AvailabilityRule[] = [1, 2, 3, 4, 5].map((d) => ({
  weekday: d, startTime: "09:00", endTime: "17:00",
}));

export async function seedDefaultAvailability(userId: string): Promise<void> {
  await setAvailability(userId, DEFAULT_AVAILABILITY);
}

export async function listAvailability(userId: string): Promise<AvailabilityRule[]> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT weekday, start_time, end_time FROM availability WHERE user_id = ? ORDER BY weekday, start_time`,
    args: [userId],
  });
  return r.rows.map((x) => {
    const row = x as Row;
    return { weekday: num(row.weekday), startTime: str(row.start_time), endTime: str(row.end_time) };
  });
}

export async function setAvailability(userId: string, rules: AvailabilityRule[]): Promise<void> {
  const c = await q();
  await c.execute({ sql: `DELETE FROM availability WHERE user_id = ?`, args: [userId] });
  for (const r of rules) {
    await c.execute({
      sql: `INSERT OR IGNORE INTO availability (user_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?)`,
      args: [userId, r.weekday, r.startTime, r.endTime],
    });
  }
}

export async function listBookings(userId: string): Promise<Booking[]> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT * FROM bookings WHERE user_id = ? ORDER BY starts_at`,
    args: [userId],
  });
  return r.rows.map((x) => mapBooking(x as Row));
}

export async function listOrgBookings(orgId: string): Promise<Booking[]> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT * FROM bookings WHERE org_id = ? ORDER BY starts_at`,
    args: [orgId],
  });
  return r.rows.map((x) => mapBooking(x as Row));
}

export async function findBookingClash(userId: string, eventSlug: string, startsAt: string): Promise<boolean> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT 1 FROM bookings WHERE user_id = ? AND event_slug = ? AND starts_at = ? AND status = 'confirmed' LIMIT 1`,
    args: [userId, eventSlug, startsAt],
  });
  return r.rows.length > 0;
}

export async function createBooking(b: Booking, meetingLinkError?: string | null): Promise<Booking> {
  const c = await q();
  await c.execute({
    sql: `INSERT INTO bookings (
            id, user_id, org_id, event_type_id, event_slug, event_title, duration,
            starts_at, ends_at, timezone, attendee_name, attendee_email,
            attendee_phone, attendee_company, purpose, notes, answers_json, attachments_json,
            location, meeting_link, meeting_link_error, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      b.id, b.userId, b.orgId, b.eventTypeId, b.eventSlug, b.eventTitle, b.duration,
      b.startsAt, b.endsAt, b.timezone, b.attendee.name, b.attendee.email,
      b.attendee.phone ?? null, b.attendee.company ?? null, b.purpose, b.notes ?? null,
      b.answers ? JSON.stringify(b.answers) : null,
      b.attachments ? JSON.stringify(b.attachments) : null,
      b.location, b.meetingLink ?? null, meetingLinkError ?? null, b.status, b.createdAt,
    ],
  });
  return b;
}

export async function attachMeetingLink(bookingId: string, link: string): Promise<void> {
  const c = await q();
  await c.execute({
    sql: `UPDATE bookings SET meeting_link = ?, meeting_link_error = NULL WHERE id = ?`,
    args: [link, bookingId],
  });
}

export async function getBookingForUser(userId: string, bookingId: string): Promise<Booking | null> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT * FROM bookings WHERE id = ? AND user_id = ?`,
    args: [bookingId, userId],
  });
  return r.rows[0] ? mapBooking(r.rows[0] as Row) : null;
}

export async function listBookedSlotsForEvent(userId: string, eventSlug: string): Promise<string[]> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT starts_at FROM bookings WHERE user_id = ? AND event_slug = ? AND status = 'confirmed'`,
    args: [userId, eventSlug],
  });
  return r.rows.map((x) => str((x as Row).starts_at));
}

export async function listIntegrations(userId: string): Promise<Integration[]> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT * FROM integrations WHERE user_id = ?`,
    args: [userId],
  });
  const found = r.rows.map((x) => mapIntegration(x as Row));
  const out: Integration[] = [];
  for (const p of ["google", "microsoft"] as const) {
    const hit = found.find((i) => i.provider === p);
    out.push(hit ?? { userId, provider: p, connected: false });
  }
  return out;
}

export async function getIntegration(userId: string, provider: Integration["provider"]): Promise<Integration | null> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT * FROM integrations WHERE user_id = ? AND provider = ?`,
    args: [userId, provider],
  });
  return r.rows[0] ? mapIntegration(r.rows[0] as Row) : null;
}

export async function upsertIntegration(i: Integration): Promise<void> {
  const c = await q();
  await c.execute({
    sql: `INSERT INTO integrations (user_id, provider, connected, account, access_token, refresh_token, expires_at, connected_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, provider) DO UPDATE SET
            connected = excluded.connected,
            account = excluded.account,
            access_token = excluded.access_token,
            refresh_token = excluded.refresh_token,
            expires_at = excluded.expires_at,
            connected_at = excluded.connected_at`,
    args: [
      i.userId, i.provider, i.connected ? 1 : 0, i.account ?? null,
      i.accessToken ?? null, i.refreshToken ?? null, i.expiresAt ?? null, i.connectedAt ?? null,
    ],
  });
}

export async function disconnectIntegration(userId: string, provider: Integration["provider"]): Promise<void> {
  const c = await q();
  await c.execute({ sql: `DELETE FROM integrations WHERE user_id = ? AND provider = ?`, args: [userId, provider] });
}

const mapQuestion = (r: Row): Question => ({
  id: str(r.id),
  eventTypeId: str(r.event_type_id),
  ord: num(r.ord),
  label: str(r.label),
  type: str(r.type) as QuestionType,
  required: num(r.required) === 1,
  options: safeJsonParse<string[] | undefined>(opt(r.options), undefined),
  placeholder: opt(r.placeholder),
});

export async function listQuestions(eventTypeId: string): Promise<Question[]> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT * FROM event_questions WHERE event_type_id = ? ORDER BY ord, id`,
    args: [eventTypeId],
  });
  return r.rows.map((x) => mapQuestion(x as Row));
}

export async function replaceQuestions(userId: string, eventTypeId: string, items: Omit<Question, "id" | "eventTypeId">[]): Promise<Question[]> {
  const c = await q();
  await c.execute({
    sql: `DELETE FROM event_questions WHERE event_type_id = ? AND user_id = ?`,
    args: [eventTypeId, userId],
  });
  const out: Question[] = [];
  for (let i = 0; i < items.length; i++) {
    const q0 = items[i];
    const id = `qst_${crypto.randomUUID().slice(0, 12)}`;
    await c.execute({
      sql: `INSERT INTO event_questions (id, event_type_id, user_id, ord, label, type, required, options, placeholder)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id, eventTypeId, userId, i, q0.label, q0.type,
        q0.required ? 1 : 0,
        q0.options ? JSON.stringify(q0.options) : null,
        q0.placeholder ?? null,
      ],
    });
    out.push({ ...q0, id, eventTypeId, ord: i });
  }
  return out;
}

const mapInvite = (r: Row): Invite => ({
  token: str(r.token),
  orgId: str(r.org_id),
  email: opt(r.email),
  role: str(r.role) as Role,
  expiresAt: str(r.expires_at),
  used: num(r.used) === 1,
  createdAt: str(r.created_at),
});

export async function createInvite(input: { orgId: string; email?: string; role: Role; ttlDays?: number }): Promise<Invite> {
  const c = await q();
  const token = `${crypto.randomUUID().replace(/-/g, "")}${crypto.randomUUID().replace(/-/g, "")}`;
  const expiresAt = new Date(Date.now() + (input.ttlDays ?? 14) * 86400_000).toISOString();
  const createdAt = new Date().toISOString();
  await c.execute({
    sql: `INSERT INTO invites (token, org_id, email, role, expires_at, used, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)`,
    args: [token, input.orgId, input.email ?? null, input.role, expiresAt, createdAt],
  });
  return { token, orgId: input.orgId, email: input.email, role: input.role, expiresAt, used: false, createdAt };
}

export async function getInvite(token: string): Promise<Invite | null> {
  const c = await q();
  const r = await c.execute({ sql: `SELECT * FROM invites WHERE token = ?`, args: [token] });
  return r.rows[0] ? mapInvite(r.rows[0] as Row) : null;
}

export async function markInviteUsed(token: string): Promise<void> {
  const c = await q();
  await c.execute({ sql: `UPDATE invites SET used = 1 WHERE token = ?`, args: [token] });
}

export async function listOrgInvites(orgId: string): Promise<Invite[]> {
  const c = await q();
  const r = await c.execute({
    sql: `SELECT * FROM invites WHERE org_id = ? ORDER BY created_at DESC`,
    args: [orgId],
  });
  return r.rows.map((x) => mapInvite(x as Row));
}

export async function deleteInvite(token: string, orgId: string): Promise<void> {
  const c = await q();
  await c.execute({ sql: `DELETE FROM invites WHERE token = ? AND org_id = ?`, args: [token, orgId] });
}
