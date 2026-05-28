import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createUser, getInvite, getOrgById, getUserByEmail, markInviteUsed,
  seedDefaultAvailability, seedDefaultEvents,
} from "@/lib/db";
import { hashPassword, slugify, startSession } from "@/lib/auth";

const Schema = z.object({
  token: z.string().min(8),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  username: z.string().min(2).max(48).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(128),
  timezone: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { token, name, email, username, password } = parsed.data;
  const invite = await getInvite(token);
  if (!invite) return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  if (invite.used) return NextResponse.json({ error: "Invite already used." }, { status: 410 });
  if (new Date(invite.expiresAt) < new Date()) return NextResponse.json({ error: "Invite expired." }, { status: 410 });
  if (invite.email && invite.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "This invite is for a different email address." }, { status: 400 });
  }
  if (await getUserByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }
  const org = await getOrgById(invite.orgId);
  if (!org) return NextResponse.json({ error: "Organization no longer exists." }, { status: 404 });

  const passwordHash = await hashPassword(password);
  const user = await createUser({
    orgId: org.id,
    name: name.trim(),
    email: email.trim(),
    username: slugify(username),
    passwordHash,
    role: invite.role,
    timezone: parsed.data.timezone ?? "UTC",
  });
  await seedDefaultEvents(user.id);
  await seedDefaultAvailability(user.id);
  await markInviteUsed(token);
  await startSession(user.id);

  const { markUserVerified } = await import("@/lib/db");
  await markUserVerified(user.id);
  return NextResponse.json({ ok: true });
}
