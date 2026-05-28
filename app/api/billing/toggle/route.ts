import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrgById, setOrgPlan } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const Schema = z.object({ plan: z.enum(["free", "pro"]) });

export async function POST(req: Request) {
  let me; try { me = await requireUser(); } catch { return NextResponse.json({ error: "Unauthenticated" }, { status: 401 }); }
  if (me.role !== "owner") return NextResponse.json({ error: "Only the org owner can change the plan." }, { status: 403 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const org = await getOrgById(me.orgId);
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });
  await setOrgPlan(org.id, parsed.data.plan);
  return NextResponse.json({ ok: true, plan: parsed.data.plan });
}
