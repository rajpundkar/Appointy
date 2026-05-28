"use client";
import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function ResendVerification() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function resend() {
    setBusy(true); setError(null); setSent(false); setManualLink(null);
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    setBusy(false);
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j.ok === false) {
      setError(j.error ?? "Failed to send.");
      if (j.manualLink) setManualLink(j.manualLink);
      return;
    }
    setSent(true);
  }

  async function copyLink() {
    if (!manualLink) return;
    try { await navigator.clipboard.writeText(manualLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt("Copy this link:", manualLink); }
  }

  return (
    <>
      <button className="btn btn-primary btn-block" onClick={resend} disabled={busy}>
        {sent ? "Sent ✓ — check your inbox" : busy ? "Sending…" : "Resend verification email"}
      </button>
      {error && (
        <div className="form-error" style={{ marginTop: 12, textAlign: "left" }}>
          <strong>Email failed:</strong> {error}
        </div>
      )}
      {manualLink && (
        <div style={{ marginTop: 12, padding: 12, border: "1px dashed var(--border-strong)", borderRadius: 10, textAlign: "left", background: "var(--bg-sunken)" }}>
          <div style={{ fontSize: ".8125rem", color: "var(--text-secondary)", marginBottom: 8 }}>
            No problem — verify yourself with this link:
          </div>
          <div style={{ display: "flex", gap: ".375rem", alignItems: "center" }}>
            <a href={manualLink} className="btn btn-primary" style={{ flex: 1, fontSize: ".8125rem" }}>
              <ExternalLink size={13} /> Verify now
            </a>
            <button onClick={copyLink} className={`btn ${copied ? "btn-success-soft" : "btn-outline"}`} style={{ fontSize: ".8125rem" }}>
              {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
