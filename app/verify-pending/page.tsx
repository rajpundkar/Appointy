import { redirect } from "next/navigation";
import { MailCheck, AlertTriangle } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { emailProvider } from "@/lib/mail";
import ResendVerification from "./ResendVerification";
import LogoutLink from "./LogoutLink";

export default async function VerifyPendingPage() {
  const me = await currentUser();
  if (!me) redirect("/login");
  if (me.emailVerified) redirect("/admin");

  const { from, ready } = emailProvider();
  const noProvider = !ready;
  const usingTestSender = ready && (!from || from.includes("onboarding@resend.dev"));

  return (
    <main style={center}>
      <div style={card}>
        <div style={iconWrap}><MailCheck size={28} /></div>
        <h1 style={h1}>Verify your email to continue</h1>
        <p style={p}>
          We sent a verification link to <strong>{me.email}</strong>. Click it to unlock your dashboard.
        </p>

        {noProvider && (
          <div style={warnBox}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>No email configured.</strong> Set <code style={codeStyle}>RESEND_API_KEY</code> and <code style={codeStyle}>RESEND_FROM</code> in <code style={codeStyle}>.env.local</code>. Until then, use the button below — when sending fails it falls back to a one-click manual link.
            </div>
          </div>
        )}
        {usingTestSender && (
          <div style={warnBox}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Resend test mode.</strong> While <code style={codeStyle}>onboarding@resend.dev</code> is the sender, Resend only delivers to your own Resend-account email. Verify <strong>appointy.xyz</strong> in Resend → Domains, then set <code style={codeStyle}>RESEND_FROM=&quot;Appointy &lt;hello@appointy.xyz&gt;&quot;</code>.
            </div>
          </div>
        )}

        <ResendVerification />
        <div style={{ marginTop: 24, fontSize: ".8125rem" }}>
          <LogoutLink />
        </div>
      </div>
    </main>
  );
}

const center: React.CSSProperties = { minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", background: "var(--bg)" };
const card: React.CSSProperties = { maxWidth: 480, padding: "2.5rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, textAlign: "center", boxShadow: "var(--shadow-md)" };
const iconWrap: React.CSSProperties = { width: 60, height: 60, borderRadius: 16, background: "var(--accent-soft)", color: "var(--text-primary)", margin: "0 auto 1.25rem", display: "grid", placeItems: "center" };
const h1: React.CSSProperties = { fontSize: "1.375rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-.01em", marginBottom: 12 };
const p: React.CSSProperties = { color: "var(--text-secondary)", fontSize: ".9375rem", lineHeight: 1.55, marginBottom: 16 };
const warnBox: React.CSSProperties = { display: "flex", gap: ".625rem", textAlign: "left", padding: "12px 14px", background: "var(--warning-soft)", border: "1px solid rgba(251,191,36,.3)", borderRadius: 10, fontSize: ".8125rem", color: "var(--warning)", lineHeight: 1.5, marginBottom: 14 };
const codeStyle: React.CSSProperties = { background: "rgba(251,191,36,.15)", padding: "1px 5px", borderRadius: 4, fontSize: ".75rem" };
