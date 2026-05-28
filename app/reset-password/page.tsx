import Link from "next/link";
import { XCircle } from "lucide-react";
import { peekPasswordResetToken } from "@/lib/db";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token ?? "";
  const userId = token ? await peekPasswordResetToken(token) : null;
  const valid = !!userId;

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: "1.75rem" }} aria-label="Appointy home">
          <img src="/logo.png" alt="Appointy" className="app-logo app-logo-xl" />
        </Link>
        {!valid && (
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <XCircle size={36} color="var(--danger)" style={{ marginBottom: 12 }} />
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>This reset link isn&apos;t valid.</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: ".9rem", lineHeight: 1.5 }}>
              It may have already been used, expired, or been replaced by a newer one.
            </p>
            <Link href="/forgot-password" className="btn btn-primary" style={{ marginTop: 20 }}>
              Request a new link
            </Link>
          </div>
        )}
        {valid && (
          <>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: ".25rem" }}>Choose a new password</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: ".9rem" }}>
              Pick something strong. We&apos;ll sign you out everywhere else.
            </p>
            <ResetPasswordForm token={token} />
          </>
        )}
      </div>
    </main>
  );
}
