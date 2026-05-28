"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setSubmitting(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong.");
      return;
    }

    router.push("/login?reset=ok");
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      <div className="form-group">
        <label className="form-label">New password</label>
        <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoFocus />
        <div className="form-hint">At least 8 characters.</div>
      </div>
      <div className="form-group">
        <label className="form-label">Confirm password</label>
        <input className="form-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
      </div>
      <button className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
