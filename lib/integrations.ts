import { google } from "googleapis";
import { getIntegration, upsertIntegration } from "./db";
import type { Booking } from "./types";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

function googleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (!clientId || !clientSecret) return null;
  return new google.auth.OAuth2(clientId, clientSecret, `${appUrl}/api/integrations/google/callback`);
}

export function googleAuthUrl(state: string): string | null {
  const c = googleClient();
  if (!c) return null;
  return c.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeGoogleCode(code: string) {
  const c = googleClient();
  if (!c) throw new Error("Google not configured");
  const { tokens } = await c.getToken(code);
  c.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: c });
  const me = await oauth2.userinfo.get();
  return {
    accessToken: tokens.access_token ?? undefined,
    refreshToken: tokens.refresh_token ?? undefined,
    expiresAt: tokens.expiry_date ?? undefined,
    email: me.data.email ?? undefined,
  };
}

function extractGoogleError(err: unknown): string {
  type GErr = { message?: string; errors?: { message?: string; reason?: string }[]; code?: number; response?: { data?: { error?: { message?: string } } } };
  const e = err as GErr;
  const inner = e?.errors?.[0];
  const responseMsg = e?.response?.data?.error?.message;
  const raw = inner?.message ?? responseMsg ?? e?.message ?? "Unknown Google error";
  if (raw.includes("Google Calendar API has not been used") || raw.includes("calendar-json.googleapis.com")) {
    return "Google Calendar API isn't enabled for this project. Open Google Cloud Console → APIs & Services → Library, search 'Google Calendar API', and click Enable. Then try again.";
  }
  if (raw.includes("invalid_grant") || raw.includes("Token has been expired or revoked")) {
    return "Your Google connection has expired. Disconnect & reconnect from the Integrations page.";
  }
  if (raw.includes("insufficient authentication") || raw.includes("insufficient_scope")) {
    return "Google connection is missing required scopes. Disconnect & reconnect from the Integrations page.";
  }
  return raw;
}

export async function createGoogleMeetEvent(
  userId: string,
  b: Booking,
): Promise<{ link: string | null; error?: string }> {
  const integ = await getIntegration(userId, "google");
  const c = googleClient();
  if (!integ?.connected) return { link: null, error: "Google not connected for this user." };
  if (!c) return { link: null, error: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set on server." };
  if (!integ.accessToken && !integ.refreshToken) {
    return { link: null, error: "No Google tokens on file. Disconnect & reconnect Google." };
  }

  c.setCredentials({
    access_token: integ.accessToken,
    refresh_token: integ.refreshToken,
    expiry_date: integ.expiresAt,
  });

  c.on("tokens", (tokens) => {
    void upsertIntegration({
      userId,
      provider: "google",
      connected: true,
      account: integ.account,
      accessToken: tokens.access_token ?? integ.accessToken,
      refreshToken: tokens.refresh_token ?? integ.refreshToken,
      expiresAt: tokens.expiry_date ?? integ.expiresAt,
      connectedAt: integ.connectedAt,
    });
  });

  const isExpired = !integ.accessToken || (integ.expiresAt != null && Date.now() > integ.expiresAt - 30_000);
  if (isExpired) {
    if (!integ.refreshToken) {
      return { link: null, error: "Google access token expired and no refresh token is available. Disconnect & reconnect Google with prompt=consent." };
    }
    try {
      const { credentials } = await c.refreshAccessToken();
      c.setCredentials(credentials);
      await upsertIntegration({
        userId,
        provider: "google",
        connected: true,
        account: integ.account,
        accessToken: credentials.access_token ?? integ.accessToken,
        refreshToken: credentials.refresh_token ?? integ.refreshToken,
        expiresAt: credentials.expiry_date ?? integ.expiresAt,
        connectedAt: integ.connectedAt,
      });
    } catch (err) {
      console.error("[google_meet] refresh failed", err);
      return { link: null, error: extractGoogleError(err) };
    }
  }

  try {
    const cal = google.calendar({ version: "v3", auth: c });
    const res = await cal.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: `${b.eventTitle} — ${b.attendee.name}`,
        description: `Purpose: ${b.purpose}${b.notes ? `\n\nNotes: ${b.notes}` : ""}`,
        start: { dateTime: b.startsAt, timeZone: b.timezone },
        end: { dateTime: b.endsAt, timeZone: b.timezone },
        attendees: [{ email: b.attendee.email, displayName: b.attendee.name }],
        conferenceData: {
          createRequest: { requestId: b.id, conferenceSolutionKey: { type: "hangoutsMeet" } },
        },
      },
    });
    const link = res.data.hangoutLink
      ?? res.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")?.uri
      ?? null;
    if (!link) {
      console.warn("[google_meet] event created but no Meet link returned", res.data);
      return { link: null, error: "Google created the event but didn't return a Meet link. Try again or check the event in Google Calendar." };
    }
    return { link };
  } catch (err) {
    const message = extractGoogleError(err);
    console.error("[google_meet] failed:", message);
    return { link: null, error: message };
  }
}

const MS_SCOPES = ["offline_access", "User.Read", "OnlineMeetings.ReadWrite", "Calendars.ReadWrite"];

export function microsoftAuthUrl(state: string): string | null {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const tenant = process.env.MICROSOFT_TENANT_ID ?? "common";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (!clientId) return null;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: `${appUrl}/api/integrations/microsoft/callback`,
    response_mode: "query",
    scope: MS_SCOPES.join(" "),
    state,
  });
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeMicrosoftCode(code: string) {
  const clientId = process.env.MICROSOFT_CLIENT_ID!;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
  const tenant = process.env.MICROSOFT_TENANT_ID ?? "common";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: `${appUrl}/api/integrations/microsoft/callback`,
    grant_type: "authorization_code",
    scope: MS_SCOPES.join(" "),
  });
  const tokRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokRes.ok) throw new Error(`MS token exchange failed: ${await tokRes.text()}`);
  const tok = await tokRes.json();
  const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tok.access_token}` },
  });
  const me = meRes.ok ? await meRes.json() : {};
  return {
    accessToken: tok.access_token as string,
    refreshToken: tok.refresh_token as string,
    expiresAt: Date.now() + tok.expires_in * 1000,
    email: (me.mail ?? me.userPrincipalName) as string | undefined,
  };
}

async function refreshMicrosoftToken(userId: string, integ: { refreshToken?: string; account?: string; connectedAt?: string }) {
  const clientId = process.env.MICROSOFT_CLIENT_ID!;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
  const tenant = process.env.MICROSOFT_TENANT_ID ?? "common";
  if (!integ.refreshToken) throw new Error("No Microsoft refresh token on file. Disconnect & reconnect.");
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: integ.refreshToken,
    grant_type: "refresh_token",
    scope: MS_SCOPES.join(" "),
  });
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Microsoft token refresh failed: ${await res.text()}`);
  const tok = await res.json();
  const next = {
    userId,
    provider: "microsoft" as const,
    connected: true,
    account: integ.account,
    accessToken: tok.access_token as string,
    refreshToken: (tok.refresh_token as string) ?? integ.refreshToken,
    expiresAt: Date.now() + (tok.expires_in as number) * 1000,
    connectedAt: integ.connectedAt,
  };
  await upsertIntegration(next);
  return next.accessToken;
}

export async function createTeamsMeeting(
  userId: string,
  b: Booking,
): Promise<{ link: string | null; error?: string }> {
  const integ = await getIntegration(userId, "microsoft");
  if (!integ?.connected) return { link: null, error: "Microsoft Teams not connected for this user." };

  let accessToken = integ.accessToken;
  if (!accessToken || (integ.expiresAt && Date.now() > integ.expiresAt - 30_000)) {
    try {
      accessToken = await refreshMicrosoftToken(userId, integ);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Microsoft refresh failed";
      console.error("[teams] refresh failed:", msg);
      return { link: null, error: msg };
    }
  }

  try {
    const res = await fetch("https://graph.microsoft.com/v1.0/me/onlineMeetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDateTime: b.startsAt,
        endDateTime: b.endsAt,
        subject: `${b.eventTitle} — ${b.attendee.name}`,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[teams] create failed", text);
      return { link: null, error: `Teams API error (${res.status}). Check the OnlineMeetings.ReadWrite permission was granted, then reconnect.` };
    }
    const json = await res.json();
    return { link: json.joinWebUrl ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Teams error";
    console.error("[teams] failed:", message);
    return { link: null, error: message };
  }
}
