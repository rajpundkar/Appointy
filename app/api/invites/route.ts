import { NextResponse } from "next/server";
import { z } from "zod";
import { createInvite, getOrgById, listOrgInvites, listOrgMembers } from "@/lib/db";
import { sendInviteEmail } from "@/lib/mail";
import { requireUser } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/plan";

const Schema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["owner", "admin", "member"]).optional().default("member"),
});

export async function GET() {
  let me; try { me = await requireUser(); } catch { return NextResponse.json({ error: "Unauthenticated" }, { status: 401 }); }
  if (me.role === "member") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const invites = await listOrgInvites(me.orgId);
  return NextResponse.json({ invites });
}

export async function POST(req: Request) {
  let me; try { me = await requireUser(); } catch { return NextResponse.json({ error: "Unauthenticated" }, { status: 401 }); }
  if (me.role === "member") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const org = await getOrgById(me.orgId);
  const plan = org?.plan ?? "free";
  if (!PLAN_LIMITS[plan].allowInvites) {
    return NextResponse.json({ error: "Inviting teammates is an Organization plan feature. Upgrade in Billing.", upgradeRequired: true }, { status: 402 });
  }
  const members = await listOrgMembers(me.orgId);
  if (members.length >= PLAN_LIMITS[plan].maxMembers) {
    return NextResponse.json({ error: `Your plan supports up to ${PLAN_LIMITS[plan].maxMembers} members.`, upgradeRequired: true }, { status: 402 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const invite = await createInvite({ orgId: me.orgId, email: parsed.data.email, role: parsed.data.role });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${base}/invite/${invite.token}`;

  let mail: { ok: boolean; error?: string } | null = null;
  if (parsed.data.email) {
    mail = await sendInviteEmail({
      to: parsed.data.email,
      orgName: org?.name ?? "your team",
      inviterName: me.name,
      token: invite.token,
    });
  }

  return NextResponse.json({ ok: true, invite: { ...invite, link }, mail });
}
