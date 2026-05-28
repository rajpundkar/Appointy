import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const me = await currentUser();
  if (me) redirect("/admin");
  const sp = await searchParams;
  const justReset = sp.reset === "ok";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: "1.75rem" }} aria-label="Appointy home">
          <img src="/logo.png" alt="Appointy" className="app-logo app-logo-xl" />
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: ".25rem" }}>Welcome back</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: ".9rem" }}>Sign in to your dashboard.</p>
        {justReset && (
          <div className="form-success" style={{ marginBottom: "1rem" }}>
            Your password was updated. Sign in with the new one.
          </div>
        )}
        <LoginForm />
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", fontSize: ".875rem" }}>
          <Link href="/forgot-password" style={{ color: "var(--text-secondary)" }}>Forgot password?</Link>
          <Link href="/signup" style={{ color: "var(--text-primary)", fontWeight: 500 }}>Create account</Link>
        </div>
      </div>
    </main>
  );
}
