import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import {
  createOrg, createPasswordResetToken, createSession, createUser, createVerificationToken,
  consumePasswordResetToken, deleteAllSessionsForUser, deleteSession,
  getOrgBySlug, getSessionUser, getUserByEmail, getUserById,
  seedDefaultAvailability, seedDefaultEvents, updateUserPassword,
} from "./db";
import { sendPasswordResetEmail, sendVerificationEmail } from "./mail";
import type { User, Org } from "./types";

const COOKIE = "scd_session";

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9_-]+/g, "-").replace(/-+/g, "-").replace(/^[-_]|[-_]$/g, "").slice(0, 48) || "team";
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

async function uniqueOrgSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let i = 1;
  while (await getOrgBySlug(slug)) {
    i += 1;
    slug = `${slugify(base)}-${i}`;
  }
  return slug;
}

export type SignupInput = {
  orgName: string;
  name: string;
  email: string;
  username: string;
  password: string;
  timezone?: string;
};

export async function signup(input: SignupInput): Promise<{ user: User; org: Org; verifyMail: { ok: boolean; error?: string } }> {
  const existing = await getUserByEmail(input.email);
  if (existing) throw new Error("An account with this email already exists.");

  const orgSlug = await uniqueOrgSlug(input.orgName);
  const org = await createOrg({ name: input.orgName.trim(), slug: orgSlug });

  const username = slugify(input.username);
  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    orgId: org.id,
    name: input.name.trim(),
    email: input.email.trim(),
    username,
    passwordHash,
    role: "owner",
    timezone: input.timezone ?? "UTC",
  });

  await seedDefaultEvents(user.id);
  await seedDefaultAvailability(user.id);

  let verifyMail: { ok: boolean; error?: string } = { ok: false, error: "not attempted" };
  try {
    const token = await createVerificationToken(user.id);
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const link = `${base}/verify?token=${encodeURIComponent(token)}`;
    verifyMail = await sendVerificationEmail(user, token);
    if (!verifyMail.ok) {

      console.warn(`\n  ⚠ Email failed (${verifyMail.error}). Verify manually:\n  ${link}\n`);
    }
  } catch (err) {
    verifyMail = { ok: false, error: err instanceof Error ? err.message : "unknown" };
    console.error("[signup] verification email failed", err);
  }

  return { user, org, verifyMail };
}

export async function login(email: string, password: string): Promise<User> {
  const u = await getUserByEmail(email);
  if (!u) throw new Error("Invalid email or password.");
  const ok = await verifyPassword(password, u.passwordHash);
  if (!ok) throw new Error("Invalid email or password.");
  const { passwordHash: _ph, ...user } = u;
  return user;
}

export async function startSession(userId: string): Promise<void> {
  const { id, expiresAt } = await createSession(userId);
  const jar = await cookies();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const sid = jar.get(COOKIE)?.value;
  if (sid) await deleteSession(sid);
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const sid = jar.get(COOKIE)?.value;
  if (!sid) return null;
  return getSessionUser(sid);
}

export async function requireUser(): Promise<User> {
  const u = await currentUser();
  if (!u) throw new Error("UNAUTHENTICATED");
  return u;
}

export async function resendVerification(user: User): Promise<{ ok: boolean; error?: string; manualLink?: string }> {
  const token = await createVerificationToken(user.id);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${base}/verify?token=${encodeURIComponent(token)}`;
  const result = await sendVerificationEmail(user, token);
  if (!result.ok) {
    console.warn(`\n  ⚠ Email failed (${result.error}). Verify manually:\n  ${link}\n`);
    return { ...result, manualLink: link };
  }
  return result;
}

export async function requestPasswordReset(email: string): Promise<{ ok: true; manualLink?: string; error?: string }> {
  const user = await getUserByEmail(email);
  if (!user) {

    return { ok: true };
  }
  const token = await createPasswordResetToken(user.id);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${base}/reset-password?token=${encodeURIComponent(token)}`;
  const result = await sendPasswordResetEmail({ ...user, passwordHash: undefined as never }, link);
  if (!result.ok) {
    console.warn(`\n  ⚠ Reset email failed (${result.error}). Manual link:\n  ${link}\n`);
    return { ok: true, manualLink: link, error: result.error };
  }
  return { ok: true };
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  const userId = await consumePasswordResetToken(token);
  if (!userId) return { ok: false, error: "This reset link is invalid or has expired." };
  const passwordHash = await hashPassword(newPassword);
  await updateUserPassword(userId, passwordHash);

  await deleteAllSessionsForUser(userId);

  const user = await getUserById(userId);
  return user ? { ok: true } : { ok: false, error: "User no longer exists." };
}
