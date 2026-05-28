"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Send, Trash2, UserPlus, Check } from "lucide-react";
import type { Invite, Role } from "@/lib/types";

type Pending = Invite & { link: string };

export default function TeamInviteCard({ pending: initial }: { pending: Pending[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending[]>(initial);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const [mailWarning, setMailWarning] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  async function invite() {
    setError(null); setMailWarning(null); setUpgrade(false);
    setSubmitting(true);
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email || undefined, role }),
    });
    setSubmitting(false);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(j.error ?? "Failed to create invite.");
      if (j.upgradeRequired) setUpgrade(true);
      return;
    }
    setPending([{ ...j.invite }, ...pending]);
    if (j.mail && !j.mail.ok && email) setMailWarning(`Couldn't email the invite (${j.mail.error}). Share the link instead.`);
    setEmail("");
    router.refresh();
  }

  async function revoke(token: string) {
    if (!confirm("Revoke this invite? The link won't work anymore.")) return;
    const res = await fetch(`/api/invites/${token}`, { method: "DELETE" });
    if (res.ok) setPending(pending.filter((p) => p.token !== token));
  }

  async function copy(token: string, link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken((t) => t === token ? null : t), 2000);
    } catch {

      window.prompt("Copy this link:", link);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 1000 }}>
      <div className="card-header"><div className="card-title">Invite teammates</div></div>
      <div style={{ padding: "1.25rem 1.25rem 0" }}>
        {error && (
          <div className="form-error" style={{ marginBottom: ".75rem" }}>
            {error}
            {upgrade && (
              <> &nbsp;<Link href="/admin/billing" style={{ color: "var(--danger)", fontWeight: 600, textDecoration: "underline" }}>Upgrade →</Link></>
            )}
          </div>
        )}
        {mailWarning && <div className="form-error" style={{ marginBottom: ".75rem", background: "var(--warning-soft)", color: "#78350f", borderColor: "#fde68a" }}>{mailWarning}</div>}
        <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 240px" }}>
            <label className="form-label">Email (optional — leave blank for a share link)</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" />
          </div>
          <div style={{ minWidth: 140 }}>
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={invite} disabled={submitting} style={{ marginBottom: 1 }}>
            {email ? <><Send size={14} /> Send invite</> : <><UserPlus size={14} /> Create link</>}
          </button>
        </div>
      </div>

      {pending.length > 0 && (
        <>
          <div style={{ padding: "1rem 1.25rem .25rem", color: "var(--text-secondary)", fontSize: ".75rem", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: 600 }}>
            Pending invites
          </div>
          <table className="table">
            <thead>
              <tr><th>Email / Link</th><th>Role</th><th>Expires</th><th></th></tr>
            </thead>
            <tbody>
              {pending.map((p) => {
                const copied = copiedToken === p.token;
                return (
                  <tr key={p.token}>
                    <td>
                      {p.email ? <strong>{p.email}</strong> : <span style={{ color: "var(--text-secondary)" }}>(share link)</span>}
                      <div style={{ fontSize: ".75rem", color: "var(--text-tertiary)", marginTop: 6, display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
                        <code style={{ fontSize: ".75rem", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.link}</code>
                        <button className={`btn ${copied ? "btn-success-soft" : "btn-ghost"}`} onClick={() => copy(p.token, p.link)} style={{ padding: "4px 8px", fontSize: ".75rem" }}>
                          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                        </button>
                      </div>
                    </td>
                    <td><span className="badge" style={{ textTransform: "capitalize" }}>{p.role}</span></td>
                    <td style={{ fontSize: ".8125rem", color: "var(--text-secondary)" }}>{new Date(p.expiresAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-ghost" onClick={() => revoke(p.token)} style={{ color: "var(--danger)", fontSize: ".8125rem" }}><Trash2 size={13} /> Revoke</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
