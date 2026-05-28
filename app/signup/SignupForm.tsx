"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgName, name, email, username, password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Signup failed.");
      return;
    }
    router.push("/verify-pending");
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      <div className="form-group">
        <label className="form-label">Workspace name <span className="req">*</span></label>
        <input className="form-input" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme — or just your name" required />
        <div className="form-hint">Becomes your organization name if you upgrade later.</div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Your name <span className="req">*</span></label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Username <span className="req">*</span></label>
          <input className="form-input" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="jane" required pattern="[a-zA-Z0-9_-]+" />
          <div className="form-hint">Your booking page: /{username || "username"}</div>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Work email <span className="req">*</span></label>
        <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
        <label className="form-label">Password <span className="req">*</span></label>
        <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        <div className="form-hint">At least 8 characters.</div>
      </div>
      <button className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? "Creating…" : "Create organization"}
      </button>
    </form>
  );
}
