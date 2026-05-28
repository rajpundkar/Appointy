import { NextResponse } from "next/server";
import { z } from "zod";
import { getEventTypeById, listQuestions, replaceQuestions } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const Schema = z.object({
  questions: z.array(z.object({
    label: z.string().min(1).max(120),
    type: z.enum(["text", "textarea", "select", "file"]),
    required: z.boolean().optional().default(false),
    options: z.array(z.string()).optional(),
    placeholder: z.string().max(200).optional(),
  })),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let me; try { me = await requireUser(); } catch { return NextResponse.json({ error: "Unauthenticated" }, { status: 401 }); }
  const { id } = await params;
  const event = await getEventTypeById(me.id, id);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ questions: await listQuestions(event.id) });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let me; try { me = await requireUser(); } catch { return NextResponse.json({ error: "Unauthenticated" }, { status: 401 }); }
  const { id } = await params;
  const event = await getEventTypeById(me.id, id);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const saved = await replaceQuestions(me.id, event.id, parsed.data.questions.map((q) => ({
    ord: 0, label: q.label.trim(), type: q.type, required: !!q.required,
    options: q.type === "select" ? (q.options ?? []).map((o) => o.trim()).filter(Boolean) : undefined,
    placeholder: q.placeholder ?? undefined,
  })));
  return NextResponse.json({ ok: true, questions: saved });
}
