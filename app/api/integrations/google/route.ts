import { NextResponse } from "next/server";
import { googleAuthUrl } from "@/lib/integrations";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const me = await currentUser();
  if (!me) return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  const url = googleAuthUrl(me.id);
  if (!url) return NextResponse.json({ error: "Google not configured" }, { status: 400 });
  return NextResponse.redirect(url);
}
