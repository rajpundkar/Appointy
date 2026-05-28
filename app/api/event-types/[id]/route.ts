import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteEventType, updateEventType } from "@/lib/db";
import { currentUser, slugify } from "@/lib/auth";

const PatchSchema = z.object({
  title: z.string().min(2).max(80).optional(),
  slug: z.string().min(1).max(48).optional(),
  duration: z.number().int().min(5).max(480).optional(),
  description: z.string().max(280).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const patch = { ...parsed.data };
  if (patch.slug) patch.slug = slugify(patch.slug);
  await updateEventType(me.id, id, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const { id } = await params;
  await deleteEventType(me.id, id);
  return NextResponse.json({ ok: true });
}
