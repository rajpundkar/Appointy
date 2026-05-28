import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(0,0,0,.7)", backdropFilter: "saturate(180%) blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ maxWidth: 1180, margin: "auto", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" aria-label="Appointy home">
            <img src="/logo.png" alt="Appointy" className="app-logo app-logo-marketing" />
          </Link>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
            <Link href="/" className="lp-nav-link">Home</Link>
            <Link href="/login" className="btn btn-ghost">Sign in</Link>
            <Link href="/signup" className="btn btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      <article style={{ maxWidth: 760, margin: "auto", padding: "3rem 1.5rem 5rem" }}>
        {children}
      </article>

      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "2rem 1.5rem 3rem", textAlign: "center",
        color: "var(--text-tertiary)", fontSize: ".8125rem",
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", marginBottom: "1rem" }}>
          <Link href="/" style={{ color: "var(--text-secondary)" }}>Home</Link>
          <Link href="/privacy" style={{ color: "var(--text-secondary)" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "var(--text-secondary)" }}>Terms</Link>
          <Link href="https://github.com/rajpundkar/Appointy" target="_blank" style={{ color: "var(--text-secondary)" }}>GitHub</Link>
        </div>
        <div>© {new Date().getFullYear()} Appointy · Open-source scheduling</div>
      </footer>
    </div>
  );
}
