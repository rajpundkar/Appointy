import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import SignupForm from "./SignupForm";

export default async function SignupPage() {
  const me = await currentUser();
  if (me) redirect("/admin");
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: "1.75rem" }} aria-label="Appointy home">
          <img src="/logo.png" alt="Appointy" className="app-logo app-logo-xl" />
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: ".25rem" }}>Create your workspace</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: ".9rem" }}>
          Free forever for a single user. Upgrade later to invite teammates.
        </p>
        <SignupForm />
        <p style={{ marginTop: "1.25rem", fontSize: ".875rem", color: "var(--text-secondary)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--brand-accent)", fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </main>
  );
}
