import { NextResponse } from "next/server";
import { z } from "zod";
import { signup, startSession } from "@/lib/auth";

const Schema = z.object({
  orgName: z.string().min(2).max(80),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  username: z.string().min(2).max(48).regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, dash, underscore only"),
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
  try {
    const { user, org, verifyMail } = await signup(parsed.data);
    await startSession(user.id);
    return NextResponse.json({ ok: true, user, org, verifyMail });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Signup failed" }, { status: 400 });
  }
}
