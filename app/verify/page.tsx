import Link from "next/link";
import { CheckCircle2, XCircle, MailQuestion } from "lucide-react";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ status?: string; token?: string }> }) {
  const sp = await searchParams;

  if (sp.token && !sp.status) {
    return (
      <main style={center}>
        <div style={card}>
          <p style={{ color: "var(--text-secondary)" }}>Verifying…</p>
          <meta httpEquiv="refresh" content={`0;url=/api/auth/verify?token=${encodeURIComponent(sp.token)}`} />
        </div>
      </main>
    );
  }
  const status = sp.status ?? "ok";
  return (
    <main style={center}>
      <div style={card}>
        {status === "ok" && (<>
          <CheckCircle2 size={48} color="#16a34a" style={{ marginBottom: 16 }} />
          <h1 style={h1}>Email verified</h1>
          <p style={p}>Your account is fully activated. You can now share your booking page with the world.</p>
          <Link href="/admin" className="btn btn-primary" style={{ marginTop: 20 }}>Go to dashboard</Link>
        </>)}
        {status === "invalid" && (<>
          <XCircle size={48} color="#dc2626" style={{ marginBottom: 16 }} />
          <h1 style={h1}>Link expired or invalid</h1>
          <p style={p}>This verification link can't be used. Sign in and request a new one from your dashboard banner.</p>
          <Link href="/login" className="btn btn-primary" style={{ marginTop: 20 }}>Sign in</Link>
        </>)}
        {status === "missing" && (<>
          <MailQuestion size={48} color="var(--text-tertiary)" style={{ marginBottom: 16 }} />
          <h1 style={h1}>Check your inbox</h1>
          <p style={p}>We sent a verification link to your email. Click it to activate your account.</p>
        </>)}
      </div>
    </main>
  );
}

const center: React.CSSProperties = { minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" };
const card: React.CSSProperties = { maxWidth: 440, padding: "2.5rem", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 16, textAlign: "center" };
const h1: React.CSSProperties = { fontSize: "1.375rem", fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" };
const p: React.CSSProperties = { color: "var(--text-secondary)", fontSize: ".9375rem", lineHeight: 1.55 };
