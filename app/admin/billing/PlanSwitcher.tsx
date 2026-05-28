"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Undo2 } from "lucide-react";
import type { Plan } from "@/lib/types";

export default function PlanSwitcher({ currentPlan }: { currentPlan: Plan }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setPlan(plan: Plan) {
    setBusy(true); setError(null);
    const res = await fetch("/api/billing/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Could not change plan.");
      return;
    }
    router.refresh();
  }

  return (
    <div style={{ marginTop: "1.5rem", padding: "1.25rem", border: "1px dashed var(--border-strong)", borderRadius: 14, maxWidth: 740, background: "var(--bg-surface)" }}>
      <div style={{ fontWeight: 600, marginBottom: ".25rem" }}>Dev plan switcher</div>
      <p style={{ color: "var(--text-secondary)", fontSize: ".875rem", marginBottom: ".875rem" }}>
        Stripe/Paddle isn&apos;t wired up yet — flip the plan instantly while you build.
      </p>
      <div style={{ display: "flex", gap: ".5rem" }}>
        {currentPlan === "free" ? (
          <button className="btn btn-primary" disabled={busy} onClick={() => setPlan("pro")}>
            <Sparkles size={15} /> Upgrade to Organization
          </button>
        ) : (
          <button className="btn btn-outline" disabled={busy} onClick={() => setPlan("free")}>
            <Undo2 size={15} /> Downgrade to Free
          </button>
        )}
      </div>
      {error && <div className="form-error" style={{ marginTop: ".75rem" }}>{error}</div>}
    </div>
  );
}
