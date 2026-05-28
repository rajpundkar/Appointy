import { NextResponse } from "next/server";
import { currentUser, resendVerification } from "@/lib/auth";

export async function POST() {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (me.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });
  const result = await resendVerification(me);
  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      error: result.error ?? "Send failed",
      manualLink: result.manualLink ?? null,
    }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
