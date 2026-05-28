import { Resend } from "resend";
import { format } from "date-fns";
import type { Attachment, Booking, User } from "./types";

let _resend: Resend | null = null;

function client(): Resend | null {
  if (_resend) return _resend;
  if (!process.env.RESEND_API_KEY) return null;
  _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

function fromAddress(): string {
  return process.env.RESEND_FROM ?? "Appointy <onboarding@resend.dev>";
}

export function emailProvider(): { name: "resend" | "none"; from: string; ready: boolean } {
  const ready = !!process.env.RESEND_API_KEY;
  return { name: ready ? "resend" : "none", from: fromAddress(), ready };
}

function fmt(iso: string, tz: string) {
  return `${format(new Date(iso), "EEEE, MMMM d, yyyy 'at' h:mm a")} (${tz})`;
}
function locationLabel(b: Booking) {
  switch (b.location) {
    case "google_meet": return "Google Meet";
    case "microsoft_teams": return "Microsoft Teams";
    case "phone": return "Phone call";
    case "in_person": return "In person";
  }
}
function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
function row(label: string, value: string) {
  return `<tr>
    <td style="padding:12px 18px;color:#6b7280;font-size:13px;width:140px;vertical-align:top">${label}</td>
    <td style="padding:12px 18px;color:#111827;font-size:14px">${value}</td>
  </tr>`;
}
function shell(inner: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const logoUrl = `${base}/logo.png`;
  return `
  <div style="background:#f4f4f5;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif">
    <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
      <div style="padding:24px 32px;border-bottom:1px solid #f1f5f9">
        <img src="${logoUrl}" alt="Appointy" style="height:28px;width:auto;display:block" />
      </div>
      <div style="padding:32px">${inner}</div>
    </div>
    <div style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">Sent by Appointy</div>
  </div>`;
}
function meetingLinkBlock(link: string, label: string) {
  return `
  <div style="margin:24px 0;padding:20px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px">
    <div style="font-size:13px;color:#4338ca;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Join via ${label}</div>
    <a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Join meeting</a>
    <div style="font-size:12px;color:#64748b;margin-top:10px;word-break:break-all">${link}</div>
  </div>`;
}
function answersRows(b: Booking) {
  if (!b.answers) return "";
  return Object.entries(b.answers).filter(([, v]) => v && v.trim()).map(([k, v]) => row(escape(k), escape(v))).join("");
}
function attachmentRow(b: Booking) {
  if (!b.attachments?.length) return "";
  return row("Attachments", b.attachments.map((a) => `${escape(a.filename)} (${(a.size/1024).toFixed(0)}KB)`).join(", "));
}

function attendeeHtml(b: Booking, hostName: string) {
  const linkBlock = b.meetingLink ? meetingLinkBlock(b.meetingLink, b.location === "google_meet" ? "Google Meet" : "Microsoft Teams") : "";
  return shell(`
    <h1 style="font-size:22px;margin:0 0 8px;color:#0f172a">You're booked!</h1>
    <p style="color:#475569;margin:0 0 24px;font-size:15px">Thanks ${escape(b.attendee.name)} — your meeting with ${escape(hostName)} is confirmed.</p>
    ${linkBlock}
    <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><tbody>
      ${row("Event", escape(b.eventTitle))}
      ${row("When", fmt(b.startsAt, b.timezone))}
      ${row("Duration", `${b.duration} minutes`)}
      ${row("Where", locationLabel(b))}
      ${row("Purpose", escape(b.purpose))}
      ${b.notes ? row("Notes", escape(b.notes)) : ""}
      ${answersRows(b)}
    </tbody></table>
    <p style="color:#64748b;font-size:13px;margin-top:24px">Need to reschedule? Just reply to this email.</p>
  `);
}
function adminHtml(b: Booking) {
  const linkBlock = b.meetingLink ? meetingLinkBlock(b.meetingLink, b.location === "google_meet" ? "Google Meet" : "Microsoft Teams") : "";
  return shell(`
    <h1 style="font-size:22px;margin:0 0 8px;color:#0f172a">New booking</h1>
    <p style="color:#475569;margin:0 0 24px;font-size:15px"><strong>${escape(b.attendee.name)}</strong> just booked <strong>${escape(b.eventTitle)}</strong>.</p>
    ${linkBlock}
    <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0"><tbody>
      ${row("When", fmt(b.startsAt, b.timezone))}
      ${row("Duration", `${b.duration} minutes`)}
      ${row("Name", escape(b.attendee.name))}
      ${row("Email", `<a href="mailto:${b.attendee.email}" style="color:#4f46e5">${b.attendee.email}</a>`)}
      ${b.attendee.phone ? row("Phone", escape(b.attendee.phone)) : ""}
      ${b.attendee.company ? row("Company", escape(b.attendee.company)) : ""}
      ${row("Where", locationLabel(b))}
      ${row("Purpose", escape(b.purpose))}
      ${b.notes ? row("Notes", escape(b.notes)) : ""}
      ${answersRows(b)}
      ${attachmentRow(b)}
    </tbody></table>
  `);
}
function verificationHtml(user: User, link: string) {
  return shell(`
    <h1 style="font-size:22px;margin:0 0 8px;color:#0f172a">Confirm your email</h1>
    <p style="color:#475569;margin:0 0 24px;font-size:15px">Hi ${escape(user.name)} — tap below to verify and activate your Appointy workspace.</p>
    <a href="${link}" style="display:inline-block;background:#000;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">Verify email</a>
    <p style="color:#64748b;font-size:13px;margin-top:24px">Or paste this link:<br><span style="word-break:break-all;color:#475569">${link}</span></p>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">This link expires in 48 hours.</p>
  `);
}
function passwordResetHtml(user: User, link: string) {
  return shell(`
    <h1 style="font-size:22px;margin:0 0 8px;color:#0f172a">Reset your password</h1>
    <p style="color:#475569;margin:0 0 24px;font-size:15px">Hi ${escape(user.name)} — we got a request to reset the password for your Appointy account. Tap the button below to choose a new one.</p>
    <a href="${link}" style="display:inline-block;background:#000;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">Reset password</a>
    <p style="color:#64748b;font-size:13px;margin-top:24px">Or paste this link:<br><span style="word-break:break-all;color:#475569">${link}</span></p>
    <p style="color:#94a3b8;font-size:12px;margin-top:24px">This link expires in 2 hours. If you didn't request a reset, you can ignore this email — your password stays the same.</p>
  `);
}

function inviteHtml(orgName: string, inviterName: string, link: string) {
  return shell(`
    <h1 style="font-size:22px;margin:0 0 8px;color:#0f172a">You're invited to ${escape(orgName)}</h1>
    <p style="color:#475569;margin:0 0 24px;font-size:15px">${escape(inviterName)} invited you to join the team on Appointy. Set up your account in 30 seconds.</p>
    <a href="${link}" style="display:inline-block;background:#000;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">Accept invite</a>
    <p style="color:#64748b;font-size:13px;margin-top:24px">Or paste this link:<br><span style="word-break:break-all;color:#475569">${link}</span></p>
  `);
}

type SendArgs = {
  to: string; subject: string; html: string; replyTo?: string;
  attachments?: Attachment[];
  context: string;
};

async function send(args: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const r = client();
  if (!r) {
    const err = "RESEND_API_KEY is not configured";
    console.warn(`[mail:${args.context}] ${err}`);
    return { ok: false, error: err };
  }
  try {
    const { data, error } = await r.emails.send({
      from: fromAddress(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      replyTo: args.replyTo,
      attachments: args.attachments?.map((a) => ({ filename: a.filename, content: a.contentBase64 })),
    });
    if (error) {
      const msg = `${error.name ?? "Resend error"}: ${error.message ?? "unknown"}`;
      console.error(`[mail:${args.context}] failed → ${args.to} — ${msg}`);
      return { ok: false, error: msg };
    }
    console.log(`[mail:${args.context}] sent to ${args.to} (id=${data?.id})`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`[mail:${args.context}] threw → ${args.to}`, err);
    return { ok: false, error: msg };
  }
}

export async function verifyMailProvider(): Promise<{ ok: boolean; provider: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, provider: "none", error: "RESEND_API_KEY is not set" };
  }
  return { ok: true, provider: "resend" };
}

export async function sendPasswordResetEmail(user: User, link: string) {
  return send({
    to: user.email,
    subject: "Reset your Appointy password",
    html: passwordResetHtml(user, link),
    context: "password-reset",
  });
}

export async function sendVerificationEmail(user: User, token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${base}/verify?token=${encodeURIComponent(token)}`;
  return send({
    to: user.email,
    subject: "Verify your email — Appointy",
    html: verificationHtml(user, link),
    context: "verify",
  });
}

export async function sendInviteEmail(opts: { to: string; orgName: string; inviterName: string; token: string }) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${base}/invite/${encodeURIComponent(opts.token)}`;
  return send({
    to: opts.to,
    subject: `${opts.inviterName} invited you to ${opts.orgName} on Appointy`,
    html: inviteHtml(opts.orgName, opts.inviterName, link),
    context: "invite",
  });
}

export async function sendBookingEmails(b: Booking, host: User) {
  const attendee = await send({
    to: b.attendee.email,
    subject: `Confirmed: ${b.eventTitle} with ${host.name}`,
    html: attendeeHtml(b, host.name),
    replyTo: host.email,
    context: "booking-attendee",
  });
  const hostResult = await send({
    to: host.email,
    replyTo: b.attendee.email,
    subject: `New booking — ${b.eventTitle} with ${b.attendee.name}`,
    html: adminHtml(b),
    attachments: b.attachments,
    context: "booking-host",
  });
  return { attendee, host: hostResult };
}
