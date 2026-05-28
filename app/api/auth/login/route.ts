import { NextResponse } from "next/server";
import { z } from "zod";
import { login, startSession } from "@/lib/auth";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    const user = await login(parsed.data.email, parsed.data.password);
    await startSession(user.id);
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Login failed" }, { status: 401 });
  }
}
