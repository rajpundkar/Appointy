import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Appointy",
  description: "How Appointy collects, uses, and protects your data.",
};

const lastUpdated = "May 28, 2026";

export default function PrivacyPage() {
  return (
    <>
      <p style={eyebrow}>Legal</p>
      <h1 style={h1}>Privacy Policy</h1>
      <p style={meta}>Last updated: {lastUpdated}</p>

      <p style={lead}>
        This Privacy Policy describes how Appointy (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;)
        collects, uses, and protects information when you use our scheduling service at
        appointy.xyz (the &ldquo;Service&rdquo;). By using the Service you agree to the practices described here.
      </p>

      <h2 style={h2}>1. Information we collect</h2>

      <h3 style={h3}>Information you provide directly</h3>
      <ul style={ul}>
        <li><strong>Account information:</strong> name, email address, workspace name, username, password (stored hashed with bcrypt), and timezone.</li>
        <li><strong>Booking information:</strong> meeting details, guest name, guest email, guest phone (optional), guest company (optional), purpose, notes, custom form answers, and any files attached to bookings (up to 5 MB).</li>
        <li><strong>Availability:</strong> the weekly hours and event types you choose to make bookable.</li>
      </ul>

      <h3 style={h3}>Information from third-party integrations</h3>
      <ul style={ul}>
        <li><strong>Google account:</strong> if you connect Google Meet/Calendar, we receive an email address, OAuth access token, and refresh token. These are stored encrypted at rest and used solely to create calendar events and Meet links for your confirmed bookings.</li>
      </ul>

      <h3 style={h3}>Automatic information</h3>
      <ul style={ul}>
        <li><strong>Session cookies:</strong> a single httpOnly cookie (&ldquo;appointy_session&rdquo;) used to keep you signed in. No advertising or tracking cookies are used.</li>
        <li><strong>Server logs:</strong> standard request logs (IP, user-agent, timestamp) retained for up to 30 days for security and debugging.</li>
      </ul>

      <h2 style={h2}>2. How we use your information</h2>
      <ul style={ul}>
        <li>To operate, maintain, and provide the Service.</li>
        <li>To send transactional emails: account verification, password reset, booking confirmations to you and your guests, invite emails, and (when you opt in) reminders.</li>
        <li>To create Google Calendar events and Meet links on your behalf, only when you explicitly grant access through OAuth.</li>
        <li>To detect, prevent, and respond to abuse, fraud, or security incidents.</li>
      </ul>

      <p style={p}>
        We <strong>do not</strong> use your data for advertising, do not sell it, and do not share it
        with third parties except as strictly required to operate the Service (see &ldquo;Service providers&rdquo; below).
      </p>

      <h2 style={h2}>3. Service providers (subprocessors)</h2>
      <p style={p}>The Service relies on these third parties to function:</p>
      <ul style={ul}>
        <li><strong>Vercel</strong> — application hosting. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener" style={a}>Privacy policy</a>.</li>
        <li><strong>Turso (libSQL)</strong> — database storage. <a href="https://turso.tech/privacy" target="_blank" rel="noopener" style={a}>Privacy policy</a>.</li>
        <li><strong>Resend</strong> — transactional email delivery. <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener" style={a}>Privacy policy</a>.</li>
        <li><strong>Google</strong> — optional Calendar/Meet integration when you connect a Google account. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" style={a}>Privacy policy</a>.</li>
      </ul>
      <p style={p}>
        Each processor receives only the data necessary to perform its function (e.g., Resend
        receives the email address and message body to deliver booking confirmations).
      </p>

      <h2 style={h2}>4. Google API Services compliance</h2>
      <p style={p}>
        Appointy&apos;s use and transfer of information received from Google APIs adheres to the
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener" style={a}> Google API Services User Data Policy</a>,
        including the Limited Use requirements. Specifically:
      </p>
      <ul style={ul}>
        <li>We only request the minimum scopes needed (<code>calendar.events</code> and <code>userinfo.email</code>).</li>
        <li>Google user data is used solely to provide user-facing features of the Service (creating calendar events and Meet links).</li>
        <li>We do not transfer Google user data to third parties except as necessary to provide or improve user-facing features, and never for advertising.</li>
        <li>We do not use Google user data to develop, improve, or train generalised AI/ML models.</li>
      </ul>

      <h2 style={h2}>5. Data retention</h2>
      <ul style={ul}>
        <li><strong>Account data</strong> is retained while your account is active.</li>
        <li><strong>Booking data</strong> is retained while your account is active so you can review past meetings.</li>
        <li><strong>OAuth tokens</strong> are kept while you have an active integration; deleted immediately when you disconnect.</li>
        <li><strong>Session records</strong> expire after 30 days of inactivity.</li>
        <li><strong>Verification &amp; password-reset tokens</strong> are single-use and expire automatically (48 hours and 2 hours respectively).</li>
        <li><strong>Server logs</strong> are retained for up to 30 days.</li>
      </ul>

      <h2 style={h2}>6. Your rights</h2>
      <p style={p}>You have the right to:</p>
      <ul style={ul}>
        <li><strong>Access</strong> the data we hold about you — request a copy by emailing us.</li>
        <li><strong>Correct</strong> inaccurate information through your account settings.</li>
        <li><strong>Delete</strong> your account and all associated data — email us to request deletion (we&apos;ll honour it within 30 days).</li>
        <li><strong>Export</strong> your bookings — request an export by emailing us.</li>
        <li><strong>Disconnect</strong> third-party integrations at any time from Admin → Integrations.</li>
        <li><strong>Withdraw consent</strong> for Google integration by revoking access at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener" style={a}>myaccount.google.com/permissions</a>.</li>
      </ul>

      <h2 style={h2}>7. Security</h2>
      <ul style={ul}>
        <li>Passwords are stored using bcrypt with cost factor 10. We never see or store your plaintext password.</li>
        <li>Session tokens are 64-character cryptographically random strings; cookies are httpOnly, SameSite=Lax, and Secure in production.</li>
        <li>OAuth tokens are stored server-side only and never exposed to the browser.</li>
        <li>All traffic uses HTTPS.</li>
        <li>The full source code is open-source under AGPL-3.0 at <a href="https://github.com/rajpundkar/Appointy" target="_blank" rel="noopener" style={a}>github.com/rajpundkar/Appointy</a> — you can audit our security practices directly.</li>
      </ul>

      <h2 style={h2}>8. Children&apos;s privacy</h2>
      <p style={p}>
        Appointy is not directed at children under 13 (or 16 in some jurisdictions). We do not
        knowingly collect data from children. If you believe a child has provided us with information,
        contact us and we&apos;ll delete it.
      </p>

      <h2 style={h2}>9. Changes to this policy</h2>
      <p style={p}>
        We may update this Privacy Policy. Material changes will be announced via email to active
        account holders and reflected here with an updated &ldquo;Last updated&rdquo; date.
      </p>

      <h2 style={h2}>10. Contact</h2>
      <p style={p}>
        For privacy questions or data requests, email <a href="mailto:privacy@appointy.xyz" style={a}>privacy@appointy.xyz</a>.
      </p>
    </>
  );
}

const eyebrow: React.CSSProperties = { color: "var(--text-tertiary)", fontSize: ".75rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: ".5rem" };
const h1: React.CSSProperties = { fontSize: "clamp(2rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-.025em", lineHeight: 1.1, color: "var(--text-primary)" };
const meta: React.CSSProperties = { color: "var(--text-tertiary)", fontSize: ".875rem", marginTop: ".5rem", marginBottom: "2rem" };
const lead: React.CSSProperties = { color: "var(--text-secondary)", fontSize: "1.0625rem", lineHeight: 1.6, marginBottom: "2rem" };
const h2: React.CSSProperties = { fontSize: "1.375rem", fontWeight: 700, letterSpacing: "-.01em", marginTop: "2.5rem", marginBottom: "1rem", color: "var(--text-primary)" };
const h3: React.CSSProperties = { fontSize: "1rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: ".5rem", color: "var(--text-primary)" };
const p: React.CSSProperties = { color: "var(--text-secondary)", lineHeight: 1.65, fontSize: ".9375rem", marginBottom: ".75rem" };
const ul: React.CSSProperties = { color: "var(--text-secondary)", lineHeight: 1.7, fontSize: ".9375rem", marginLeft: "1.25rem", marginBottom: "1rem" };
const a: React.CSSProperties = { color: "var(--text-primary)", textDecoration: "underline", textDecorationColor: "var(--border-strong)" };
