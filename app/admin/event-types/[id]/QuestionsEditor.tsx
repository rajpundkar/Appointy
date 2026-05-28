"use client";
import { useState } from "react";
import { GripVertical, Plus, Trash2, Save, ChevronUp, ChevronDown } from "lucide-react";
import type { Question, QuestionType } from "@/lib/types";

type Draft = Omit<Question, "id" | "eventTypeId"> & { id?: string };

const TYPE_LABELS: Record<QuestionType, string> = {
  text: "Short text",
  textarea: "Long text",
  select: "Dropdown",
  file: "File upload",
};

export default function QuestionsEditor({ eventTypeId, initial }: { eventTypeId: string; initial: Question[] }) {
  const [items, setItems] = useState<Draft[]>(initial.map((q) => ({
    id: q.id, ord: q.ord, label: q.label, type: q.type, required: q.required,
    options: q.options ?? [], placeholder: q.placeholder ?? "",
  })));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patch(i: number, p: Partial<Draft>) {
    setItems((s) => s.map((it, idx) => idx === i ? { ...it, ...p } : it));
    setSavedAt(null);
  }
  function add() {
    setItems((s) => [...s, { ord: s.length, label: "New question", type: "text", required: false, options: [], placeholder: "" }]);
  }
  function remove(i: number) { setItems((s) => s.filter((_, idx) => idx !== i)); }
  function move(i: number, dir: -1 | 1) {
    setItems((s) => {
      const next = [...s];
      const j = i + dir;
      if (j < 0 || j >= next.length) return next;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    setSaving(true); setError(null);
    const res = await fetch(`/api/event-types/${eventTypeId}/questions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questions: items.map((q) => ({
          label: q.label, type: q.type, required: q.required,
          options: q.type === "select" ? q.options : undefined,
          placeholder: q.placeholder || undefined,
        })),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Save failed.");
      return;
    }
    setSavedAt(new Date().toLocaleTimeString());
  }

  return (
    <>
      <div className="card" style={{ maxWidth: 820 }}>
        {items.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            No custom questions yet. Add one to start collecting more info on your booking form.
          </div>
        )}
        {items.map((q, i) => (
          <div key={q.id ?? i} className="question-row">
            <div className="question-handle">
              <button className="btn btn-ghost" onClick={() => move(i, -1)} title="Move up"><ChevronUp size={14} /></button>
              <button className="btn btn-ghost" onClick={() => move(i, +1)} title="Move down"><ChevronDown size={14} /></button>
              <GripVertical size={14} color="var(--text-tertiary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Question label</label>
                  <input className="form-input" value={q.label} onChange={(e) => patch(i, { label: e.target.value })} placeholder="e.g. What's your role?" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Type</label>
                  <select className="form-select" value={q.type} onChange={(e) => patch(i, { type: e.target.value as QuestionType })}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              {(q.type === "text" || q.type === "textarea") && (
                <div className="form-group" style={{ marginTop: ".75rem", marginBottom: 0 }}>
                  <label className="form-label">Placeholder (optional)</label>
                  <input className="form-input" value={q.placeholder ?? ""} onChange={(e) => patch(i, { placeholder: e.target.value })} />
                </div>
              )}
              {q.type === "select" && (
                <div className="form-group" style={{ marginTop: ".75rem", marginBottom: 0 }}>
                  <label className="form-label">Options (one per line)</label>
                  <textarea className="form-textarea" value={(q.options ?? []).join("\n")} onChange={(e) => patch(i, { options: e.target.value.split("\n") })} placeholder="Option A&#10;Option B" style={{ minHeight: 72 }} />
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginTop: ".75rem", justifyContent: "space-between" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", fontSize: ".875rem" }}>
                  <input type="checkbox" checked={q.required} onChange={(e) => patch(i, { required: e.target.checked })} style={{ accentColor: "var(--accent)" }} />
                  Required
                </label>
                <button className="btn btn-ghost" onClick={() => remove(i)} style={{ color: "var(--danger)", fontSize: ".8125rem" }}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--border)" }}>
          <button className="btn btn-outline" onClick={add}><Plus size={14} /> Add question</button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.25rem", maxWidth: 820 }}>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          <Save size={15} /> {saving ? "Saving…" : "Save questions"}
        </button>
        {savedAt && <span style={{ color: "var(--success)", fontSize: ".875rem" }}>Saved at {savedAt}</span>}
        {error && <span className="form-error" style={{ margin: 0 }}>{error}</span>}
      </div>
    </>
  );
}
