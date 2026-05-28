"use client";
import { useMemo, useState } from "react";
import { Save, Globe, Copy } from "lucide-react";
import type { AvailabilityRule } from "@/lib/types";
import { WEEKDAY_LABELS } from "@/lib/availability";

type DayState = { enabled: boolean; startTime: string; endTime: string };

function rulesToDays(rules: AvailabilityRule[]): DayState[] {
  const out: DayState[] = Array.from({ length: 7 }, () => ({ enabled: false, startTime: "09:00", endTime: "17:00" }));
  for (const r of rules) {
    out[r.weekday] = { enabled: true, startTime: r.startTime, endTime: r.endTime };
  }
  return out;
}

export default function AvailabilityEditor({ initial, timezone }: { initial: AvailabilityRule[]; timezone: string }) {
  const [days, setDays] = useState<DayState[]>(() => rulesToDays(initial));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patch(d: number, p: Partial<DayState>) {
    setDays((s) => s.map((day, i) => (i === d ? { ...day, ...p } : day)));
    setSavedAt(null);
  }

  function copyToAll(d: number) {
    const src = days[d];
    if (!src.enabled) return;
    setDays((s) => s.map((day) => (day.enabled ? { ...day, startTime: src.startTime, endTime: src.endTime } : day)));
  }

  const rules = useMemo<AvailabilityRule[]>(() => {
    return days
      .map((d, i) => (d.enabled ? { weekday: i, startTime: d.startTime, endTime: d.endTime } : null))
      .filter((x): x is AvailabilityRule => !!x);
  }, [days]);

  async function save() {
    setSaving(true); setError(null);
    const res = await fetch("/api/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Save failed");
      return;
    }
    setSavedAt(new Date().toLocaleTimeString());
  }

  return (
    <>
      <div className="card" style={{ maxWidth: 820, marginBottom: "1.25rem" }}>
        <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: ".5rem", color: "var(--text-secondary)", fontSize: ".875rem" }}>
          <Globe size={15} /> Times are in <strong style={{ color: "var(--text-primary)", marginLeft: 4 }}>{timezone}</strong>.
        </div>
      </div>

      <div className="card" style={{ maxWidth: 820 }}>
        {days.map((d, i) => (
          <div key={i} className="avail-row">
            <label className="avail-day">
              <input type="checkbox" checked={d.enabled} onChange={(e) => patch(i, { enabled: e.target.checked })} />
              <span>{WEEKDAY_LABELS[i]}</span>
            </label>
            {d.enabled ? (
              <div className="avail-times">
                <input type="time" className="form-input avail-time" value={d.startTime} onChange={(e) => patch(i, { startTime: e.target.value })} />
                <span style={{ color: "var(--text-tertiary)" }}>—</span>
                <input type="time" className="form-input avail-time" value={d.endTime} onChange={(e) => patch(i, { endTime: e.target.value })} />
                <button className="btn btn-ghost avail-copy" title="Apply these times to every active day" onClick={() => copyToAll(i)}>
                  <Copy size={14} /> Apply to all
                </button>
              </div>
            ) : (
              <div style={{ color: "var(--text-tertiary)", fontSize: ".875rem" }}>Unavailable</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.25rem", maxWidth: 820 }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <Save size={15} /> {saving ? "Saving…" : "Save availability"}
        </button>
        {savedAt && <span style={{ color: "var(--success)", fontSize: ".875rem" }}>Saved at {savedAt}</span>}
        {error && <span className="form-error" style={{ margin: 0 }}>{error}</span>}
      </div>
    </>
  );
}
