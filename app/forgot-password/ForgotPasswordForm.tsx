"use client";
import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(null); setManualLink(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubmitting(false);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(j.error ?? "Something went wrong.");
      return;
    }
    setSent(true);
    if (j.manualLink) setManualLink(j.manualLink);
  }

  async function copyLink() {
    if (!manualLink) return;
    try { await navigator.clipboard.writeText(manualLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt("Copy this link:", manualLink); }
  }

  if (sent) {
    return (
      <div>
        <div className="form-success">
          <strong>Check your inbox.</strong> If an account exists for <strong>{email}</strong>, we&apos;ve sent a password-reset link. It expires in 2 hours.
        </div>
        {manualLink && (
          <div style={{ marginTop: 12, padding: 12, border: "1px dashed var(--border-strong)", borderRadius: 10, background: "var(--bg-sunken)" }}>
            <div style={{ fontSize: ".8125rem", color: "var(--text-secondary)", marginBottom: 8 }}>
              Email send failed — use this link directly:
            </div>
            <div style={{ display: "flex", gap: ".375rem" }}>
              <a href={manualLink} className="btn btn-primary" style={{ flex: 1, fontSize: ".8125rem" }}>
                <ExternalLink size={13} /> Reset now
              </a>
              <button onClick={copyLink} className={`btn ${copied ? "btn-success-soft" : "btn-outline"}`} style={{ fontSize: ".8125rem" }}>
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      </div>
      <button className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
