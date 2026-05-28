import { NextResponse } from "next/server";
import { deleteInvite, getInvite } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  let me; try { me = await requireUser(); } catch { return NextResponse.json({ error: "Unauthenticated" }, { status: 401 }); }
  if (me.role === "member") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite || invite.orgId !== me.orgId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteInvite(token, me.orgId);
  return NextResponse.json({ ok: true });
}
