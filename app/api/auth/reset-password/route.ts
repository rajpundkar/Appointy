import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/auth";
import { peekPasswordResetToken } from "@/lib/db";

const Schema = z.object({
  token: z.string().min(8),
  password: z.string().min(8).max(128),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false }, { status: 200 });
  const userId = await peekPasswordResetToken(token);
  return NextResponse.json({ valid: !!userId });
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
