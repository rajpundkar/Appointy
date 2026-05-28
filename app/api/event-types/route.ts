import { NextResponse } from "next/server";
import { z } from "zod";
import { createEventType, listEventTypes } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { slugify } from "@/lib/auth";

const Schema = z.object({
  title: z.string().min(2).max(80),
  slug: z.string().min(1).max(48).optional(),
  duration: z.number().int().min(5).max(480),
  description: z.string().max(280).optional().default(""),
  active: z.boolean().optional().default(true),
});

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const events = await listEventTypes(me.id);
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const slug = slugify(parsed.data.slug || `${parsed.data.duration}min-${Math.random().toString(36).slice(2, 5)}`);
  try {
    const event = await createEventType(me.id, {
      slug,
      title: parsed.data.title.trim(),
      duration: parsed.data.duration,
      description: parsed.data.description?.trim() || undefined,
      active: parsed.data.active,
    });
    return NextResponse.json({ ok: true, event });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Create failed" }, { status: 400 });
  }
}
