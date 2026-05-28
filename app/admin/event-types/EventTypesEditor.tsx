"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Save, Link as LinkIcon, ListChecks } from "lucide-react";
import type { EventType } from "@/lib/types";

type Draft = EventType & { dirty?: boolean; saving?: boolean };

export default function EventTypesEditor({ initial, username }: { initial: EventType[]; username: string }) {
  const [items, setItems] = useState<Draft[]>(initial);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDraft, setNewDraft] = useState({ title: "", slug: "", duration: 30, description: "" });

  function patch(i: number, p: Partial<Draft>) {
    setItems((s) => s.map((it, idx) => (idx === i ? { ...it, ...p, dirty: true } : it)));
  }

  async function save(i: number) {
    const e = items[i];
    setItems((s) => s.map((it, idx) => (idx === i ? { ...it, saving: true } : it)));
    setError(null);
    const res = await fetch(`/api/event-types/${e.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: e.title, slug: e.slug, duration: e.duration,
        description: e.description ?? "", active: e.active,
      }),
    });
    setItems((s) => s.map((it, idx) => (idx === i ? { ...it, saving: false, dirty: !res.ok } : it)));
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Save failed");
    }
  }

  async function remove(i: number) {
    const e = items[i];
    if (!confirm(`Delete "${e.title}"? Existing bookings stay.`)) return;
    const res = await fetch(`/api/event-types/${e.id}`, { method: "DELETE" });
    if (res.ok) setItems((s) => s.filter((_, idx) => idx !== i));
  }

  async function create() {
    if (!newDraft.title.trim()) { setError("Title is required"); return; }
    setCreating(true); setError(null);
    const res = await fetch(`/api/event-types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newDraft, slug: newDraft.slug || undefined, active: true }),
    });
    setCreating(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Create failed");
      return;
    }
    const j = await res.json();
    setItems((s) => [...s, j.event]);
    setNewDraft({ title: "", slug: "", duration: 30, description: "" });
  }

  return (
    <>
      {error && <div className="form-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div className="event-grid">
        {items.map((e, i) => (
          <div key={e.id} className="event-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label className="toggle-switch">
                <input type="checkbox" checked={e.active} onChange={(ev) => patch(i, { active: ev.target.checked })} />
                <span />
              </label>
              <button className="btn btn-ghost" onClick={() => remove(i)} title="Delete"><Trash2 size={15} /></button>
            </div>
            <input className="form-input event-title-input" value={e.title} onChange={(ev) => patch(i, { title: ev.target.value })} placeholder="Title" />
            <textarea className="form-textarea" value={e.description ?? ""} onChange={(ev) => patch(i, { description: ev.target.value })} placeholder="Short description (optional)" style={{ minHeight: 60 }} />
            <div className="form-row" style={{ marginTop: ".5rem" }}>
              <div>
                <label className="form-label">Duration (min)</label>
                <input className="form-input" type="number" min={5} max={480} step={5} value={e.duration} onChange={(ev) => patch(i, { duration: Number(ev.target.value) })} />
              </div>
              <div>
                <label className="form-label">URL slug</label>
                <input className="form-input" value={e.slug} onChange={(ev) => patch(i, { slug: ev.target.value })} />
              </div>
            </div>
            <div className="event-card-footer">
              <a href={`/${username}/${e.slug}`} target="_blank" rel="noopener" className="event-link">
                <LinkIcon size={12} /> /{username}/{e.slug}
              </a>
              <div style={{ display: "flex", gap: ".375rem" }}>
                <Link href={`/admin/event-types/${e.id}`} className="btn btn-outline" style={{ fontSize: ".8125rem", padding: ".4375rem .625rem" }}>
                  <ListChecks size={13} /> Form
                </Link>
                <button className="btn btn-primary" disabled={!e.dirty || e.saving} onClick={() => save(i)}>
                  <Save size={14} /> {e.saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="event-card event-card-new">
          <h3 style={{ fontWeight: 600, marginBottom: ".75rem" }}><Plus size={16} style={{ verticalAlign: "-3px" }} /> New event type</h3>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={newDraft.title} onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })} placeholder="e.g. Discovery call" />
          </div>
          <div className="form-row">
            <div>
              <label className="form-label">Duration</label>
              <input className="form-input" type="number" min={5} max={480} step={5} value={newDraft.duration} onChange={(e) => setNewDraft({ ...newDraft, duration: Number(e.target.value) })} />
            </div>
            <div>
              <label className="form-label">Slug (optional)</label>
              <input className="form-input" value={newDraft.slug} onChange={(e) => setNewDraft({ ...newDraft, slug: e.target.value })} placeholder="auto" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={newDraft.description} onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })} style={{ minHeight: 60 }} />
          </div>
          <button className="btn btn-primary btn-block" onClick={create} disabled={creating}>
            {creating ? "Creating…" : "Create event type"}
          </button>
        </div>
      </div>
    </>
  );
}
