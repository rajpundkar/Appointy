import { NextResponse } from "next/server";
import { consumeVerificationToken, markUserVerified } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/verify?status=missing", req.url));
  const userId = await consumeVerificationToken(token);
  if (!userId) return NextResponse.redirect(new URL("/verify?status=invalid", req.url));
  await markUserVerified(userId);

  return NextResponse.redirect(new URL("/verify?status=ok", req.url));
}
