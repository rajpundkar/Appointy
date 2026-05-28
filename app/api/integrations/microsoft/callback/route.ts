import { NextResponse } from "next/server";
import { exchangeMicrosoftCode } from "@/lib/integrations";
import { upsertIntegration, getUserById } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return NextResponse.redirect(new URL("/admin/integrations?error=missing_code", req.url));
  const user = await getUserById(state);
  if (!user) return NextResponse.redirect(new URL("/admin/integrations?error=invalid_state", req.url));
  try {
    const tok = await exchangeMicrosoftCode(code);
    await upsertIntegration({
      userId: user.id,
      provider: "microsoft",
      connected: true,
      account: tok.email,
      accessToken: tok.accessToken,
      refreshToken: tok.refreshToken,
      expiresAt: tok.expiresAt,
      connectedAt: new Date().toISOString(),
    });
    return NextResponse.redirect(new URL("/admin/integrations?connected=microsoft", req.url));
  } catch (err) {
    console.error("[microsoft/callback]", err);
    return NextResponse.redirect(new URL("/admin/integrations?error=microsoft_failed", req.url));
  }
}
