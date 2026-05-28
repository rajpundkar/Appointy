import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/auth";

const Schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  const result = await requestPasswordReset(parsed.data.email);

  return NextResponse.json({ ok: true, manualLink: result.manualLink ?? null });
}
