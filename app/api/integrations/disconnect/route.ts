import { NextResponse } from "next/server";
import { z } from "zod";
import { disconnectIntegration } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const Schema = z.object({ provider: z.enum(["google", "microsoft"]) });

export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await disconnectIntegration(me.id, parsed.data.provider);
  return NextResponse.json({ ok: true });
}
