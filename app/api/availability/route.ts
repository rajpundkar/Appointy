import { NextResponse } from "next/server";
import { z } from "zod";
import { listAvailability, setAvailability } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const Schema = z.object({
  rules: z.array(z.object({
    weekday: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  })),
});

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  return NextResponse.json({ rules: await listAvailability(me.id) });
}

export async function PUT(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  for (const r of parsed.data.rules) {
    if (r.startTime >= r.endTime) {
      return NextResponse.json({ error: `Start must be before end on weekday ${r.weekday}` }, { status: 400 });
    }
  }
  await setAvailability(me.id, parsed.data.rules);
  return NextResponse.json({ ok: true });
}
