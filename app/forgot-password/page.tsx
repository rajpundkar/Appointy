import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: "1.75rem" }} aria-label="Appointy home">
          <img src="/logo.png" alt="Appointy" className="app-logo app-logo-xl" />
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: ".25rem" }}>Reset your password</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: ".9rem" }}>
          Enter your email and we&apos;ll send you a link to choose a new one.
        </p>
        <ForgotPasswordForm />
        <p style={{ marginTop: "1.25rem", fontSize: ".875rem", color: "var(--text-secondary)" }}>
          Remembered it? <Link href="/login" style={{ color: "var(--text-primary)", fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}
