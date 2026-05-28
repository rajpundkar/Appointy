import { NextResponse } from "next/server";
import { attachMeetingLink, getBookingForUser, getUserById } from "@/lib/db";
import { createGoogleMeetEvent, createTeamsMeeting } from "@/lib/integrations";
import { sendBookingEmails } from "@/lib/mail";
import { requireUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let me;
  try { me = await requireUser(); } catch { return NextResponse.json({ error: "Unauthenticated" }, { status: 401 }); }
  const { id } = await params;
  const booking = await getBookingForUser(me.id, id);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (booking.location !== "google_meet" && booking.location !== "microsoft_teams") {
    return NextResponse.json({ error: "This booking isn't a video meeting." }, { status: 400 });
  }
  if (booking.meetingLink) {
    return NextResponse.json({ ok: true, alreadyHasLink: true, meetingLink: booking.meetingLink });
  }

  const result = booking.location === "google_meet"
    ? await createGoogleMeetEvent(me.id, booking)
    : await createTeamsMeeting(me.id, booking);

  if (!result.link) {
    return NextResponse.json({ ok: false, error: result.error ?? "Could not generate link." }, { status: 500 });
  }

  await attachMeetingLink(booking.id, result.link);
  booking.meetingLink = result.link;

  const host = await getUserById(me.id);
  if (host) {
    await sendBookingEmails(booking, host);
  }

  return NextResponse.json({ ok: true, meetingLink: result.link });
}
