import Link from "next/link";
import { getInvite, getOrgById } from "@/lib/db";
import AcceptInviteForm from "./AcceptInviteForm";

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInvite(token);
  const valid = !!invite && !invite.used && new Date(invite.expiresAt) > new Date();
  const org = invite ? await getOrgById(invite.orgId) : null;

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Link href="/" style={{ display: "inline-block", marginBottom: "1.75rem" }} aria-label="Appointy home">
          <img src="/logo.png" alt="Appointy" className="app-logo app-logo-xl" />
        </Link>
        {!valid && (
          <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>This invite isn&apos;t valid.</h1>
            <p style={{ color: "var(--text-secondary)", marginTop: ".5rem" }}>
              It may have expired, been used, or been revoked. Ask your team admin for a new link.
            </p>
          </div>
        )}
        {valid && (
          <>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: ".25rem" }}>Join {org?.name}</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: ".9rem" }}>
              You&apos;re joining as <strong>{invite!.role}</strong>. Create your account below.
            </p>
            <AcceptInviteForm token={token} email={invite!.email ?? ""} />
          </>
        )}
      </div>
    </main>
  );
}
