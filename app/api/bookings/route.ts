import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import {
  attachMeetingLink, createBooking, findBookingClash, getEventType,
  getUserByUsername, listQuestions,
} from "@/lib/db";
import { sendBookingEmails } from "@/lib/mail";
import { createGoogleMeetEvent, createTeamsMeeting } from "@/lib/integrations";
import type { Attachment, Booking, Question } from "@/lib/types";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = /^(image|application|text)\

function bad(msg: string, code = 400) { return NextResponse.json({ error: msg }, { status: code }); }

export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("multipart/form-data")) {
    return bad("Expected multipart/form-data", 415);
  }
  const form = await req.formData();

  const username = String(form.get("username") ?? "");
  const eventSlug = String(form.get("eventSlug") ?? "");
  const startsAt = String(form.get("startsAt") ?? "");
  const timezone = String(form.get("timezone") ?? "");
  const purpose = String(form.get("purpose") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();
  const location = String(form.get("location") ?? "");
  const attendeeName = String(form.get("attendeeName") ?? "").trim();
  const attendeeEmail = String(form.get("attendeeEmail") ?? "").trim().toLowerCase();
  const attendeePhone = String(form.get("attendeePhone") ?? "").trim();
  const attendeeCompany = String(form.get("attendeeCompany") ?? "").trim();

  if (!username || !eventSlug || !startsAt || !timezone) return bad("Missing booking fields.");
  if (!attendeeName || !attendeeEmail || !purpose) return bad("Name, email, and purpose are required.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(attendeeEmail)) return bad("Invalid email.");
  if (!["google_meet","phone","in_person"].includes(location)) {
    return bad("Invalid location. Microsoft Teams and Zoom are coming soon.");
  }

  const host = await getUserByUsername(username);
  if (!host) return bad("Unknown host", 404);
  const event = await getEventType(host.id, eventSlug);
  if (!event || !event.active) return bad("Unknown event", 404);
  if (await findBookingClash(host.id, event.slug, startsAt)) {
    return bad("That time was just taken — please pick another.", 409);
  }

  const questions: Question[] = await listQuestions(event.id);
  const answers: Record<string, string> = {};
  for (const q of questions) {
    if (q.type === "file") continue;
    const v = (form.get(`q_${q.id}`) ?? "").toString().trim();
    if (q.required && !v) return bad(`"${q.label}" is required.`);
    if (v) answers[q.label] = v;
  }

  const attachments: Attachment[] = [];
  const fileEntries: { question?: Question; file: File }[] = [];
  for (const q of questions.filter((x) => x.type === "file")) {
    const f = form.get(`q_${q.id}`);
    if (f instanceof File && f.size > 0) fileEntries.push({ question: q, file: f });
    else if (q.required) return bad(`"${q.label}" is required.`);
  }

  const generic = form.getAll("attachment");
  for (const f of generic) if (f instanceof File && f.size > 0) fileEntries.push({ file: f });

  if (fileEntries.length > MAX_FILES) return bad(`Too many files (max ${MAX_FILES}).`);
  for (const { file, question } of fileEntries) {
    if (file.size > MAX_FILE_BYTES) return bad(`"${file.name}" is over 5MB.`);
    if (!ALLOWED_TYPES.test(file.type || "application/octet-stream")) return bad(`"${file.name}" has an unsupported type.`);
    const buf = Buffer.from(await file.arrayBuffer());
    attachments.push({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      contentBase64: buf.toString("base64"),
    });
    if (question) answers[question.label] = `${file.name} (${(file.size/1024).toFixed(0)} KB)`;
  }

  const endsAt = addMinutes(new Date(startsAt), event.duration).toISOString();
  const id = `bk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

  const booking: Booking = {
    id,
    userId: host.id,
    orgId: host.orgId,
    eventTypeId: event.id,
    eventSlug: event.slug,
    eventTitle: event.title,
    duration: event.duration,
    startsAt,
    endsAt,
    timezone,
    attendee: {
      name: attendeeName,
      email: attendeeEmail,
      phone: attendeePhone || undefined,
      company: attendeeCompany || undefined,
    },
    purpose,
    notes: notes || undefined,
    answers: Object.keys(answers).length ? answers : undefined,
    attachments: attachments.length ? attachments : undefined,
    location: location as Booking["location"],
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  let linkError: string | null = null;
  if (location === "google_meet") {
    const r = await createGoogleMeetEvent(host.id, booking);
    if (r.link) booking.meetingLink = r.link;
    else linkError = r.error ?? "Could not generate Google Meet link.";
  } else if (location === "microsoft_teams") {
    const r = await createTeamsMeeting(host.id, booking);
    if (r.link) booking.meetingLink = r.link;
    else linkError = r.error ?? "Could not generate Teams link.";
  }

  await createBooking(booking, linkError);
  const mailResult = await sendBookingEmails(booking, host);

  return NextResponse.json({
    ok: true,
    booking: {
      id: booking.id,
      meetingLink: booking.meetingLink,
      startsAt: booking.startsAt,
    },
    linkError,
    mail: {
      attendee: mailResult.attendee,
      host: mailResult.host,
    },
  });
}
