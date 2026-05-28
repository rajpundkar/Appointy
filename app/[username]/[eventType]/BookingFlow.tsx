"use client";
import { useMemo, useState } from "react";
import {
  addDays, addMonths, format, isSameDay, isSameMonth, startOfMonth, startOfToday, subMonths,
} from "date-fns";
import {
  Calendar as CalIcon, Clock, Globe, Video, ChevronLeft, ChevronRight, ArrowLeft, CheckCircle2,
  Paperclip, X, Users,
} from "lucide-react";
import { availableWeekdays, slotsForWeekday } from "@/lib/availability";
import { buildSlotDate } from "@/lib/time";
import type { AvailabilityRule, EventType, Question } from "@/lib/types";

type Step = "pick" | "form" | "done";

export default function BookingFlow({
  username,
  hostName,
  timezone,
  event,
  takenSlots,
  availability,
  questions,
  teammate,
  prefill,
}: {
  username: string;
  hostName: string;
  timezone: string;
  event: EventType;
  takenSlots: string[];
  availability: AvailabilityRule[];
  questions: Question[];
  teammate?: { orgName: string };
  prefill?: { name?: string; email?: string };
}) {
  const today = startOfToday();
  const [step, setStep] = useState<Step>("pick");
  const [month, setMonth] = useState<Date>(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState<"google_meet" | "microsoft_teams" | "phone" | "in_person">("google_meet");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ meetingLink?: string; startsAt: string; linkError?: string | null } | null>(null);

  const openWeekdays = useMemo(() => availableWeekdays(availability), [availability]);
  const takenSet = useMemo(() => new Set(takenSlots), [takenSlots]);

  function availableSlotsForDay(d: Date): string[] {
    const candidates = slotsForWeekday(availability, d.getDay(), event.duration);
    const isToday = isSameDay(d, today);
    return candidates.filter((t) => {
      const dt = buildSlotDate(d, t);
      if (isToday && dt <= new Date()) return false;
      if (takenSet.has(dt.toISOString())) return false;
      return true;
    });
  }

  const monthDays = useMemo(() => {
    const start = startOfMonth(month);
    const offset = start.getDay();
    const out: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) out.push(null);
    for (let i = 0; i < 35 - offset; i++) out.push(addDays(start, i));
    return out;
  }, [month]);

  const dailySlots = useMemo(() => selectedDate ? availableSlotsForDay(selectedDate) : [], [selectedDate, availability, event.duration, takenSet]);

  async function submit() {
    if (!selectedDate || !selectedTime) return;
    if (!name.trim() || !email.trim() || !purpose.trim()) {
      setError("Name, email and purpose are required.");
      return;
    }
    for (const q of questions) {
      if (!q.required) continue;
      if (q.type === "file") {
        if (!files[q.id]) { setError(`"${q.label}" is required.`); return; }
      } else if (!(answers[q.id] ?? "").trim()) {
        setError(`"${q.label}" is required.`); return;
      }
    }
    setSubmitting(true); setError(null);

    const startsAt = buildSlotDate(selectedDate, selectedTime).toISOString();
    const fd = new FormData();
    fd.set("username", username);
    fd.set("eventSlug", event.slug);
    fd.set("startsAt", startsAt);
    fd.set("timezone", timezone);
    fd.set("purpose", purpose);
    fd.set("notes", notes);
    fd.set("location", location);
    fd.set("attendeeName", name);
    fd.set("attendeeEmail", email);
    fd.set("attendeePhone", phone);
    fd.set("attendeeCompany", company);
    for (const q of questions) {
      if (q.type === "file") {
        const f = files[q.id];
        if (f) fd.set(`q_${q.id}`, f);
      } else {
        fd.set(`q_${q.id}`, answers[q.id] ?? "");
      }
    }

    const res = await fetch("/api/bookings", { method: "POST", body: fd });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong. Please try again.");
      return;
    }
    const j = await res.json();
    setConfirmation({ meetingLink: j.booking?.meetingLink, startsAt, linkError: j.linkError });
    setStep("done");
  }

  const hasNoAvailability = availability.length === 0;
  const wantsLink = location === "google_meet" || location === "microsoft_teams";

  return (
    <div className="public-shell">
      <div className="public-card">
        <aside className="public-aside">
          <div className="avatar">{hostName.charAt(0).toUpperCase()}</div>
          <div className="host">{hostName}</div>
          <div className="booking-title">{event.title}</div>
          {event.description && <p className="booking-desc">{event.description}</p>}
          <div className="booking-details">
            <div className="booking-details-row"><Clock size={16} /><span>{event.duration} min</span></div>
            <div className="booking-details-row"><Globe size={16} /><span>{timezone}</span></div>
            <div className="booking-details-row"><Video size={16} /><span>Web conferencing details on confirmation</span></div>
            {selectedDate && selectedTime && (
              <div className="booking-details-row"><CalIcon size={16} /><span>{format(buildSlotDate(selectedDate, selectedTime), "EEE, MMM d · h:mm a")}</span></div>
            )}
          </div>
        </aside>

        <main className="public-main">
          {teammate && (
            <div className="team-banner">
              <Users size={16} />
              <div>
                <strong>Booking inside {teammate.orgName}.</strong>
                <span style={{ color: "var(--text-secondary)" }}> Your name and email are filled in for you.</span>
              </div>
            </div>
          )}
          {step === "pick" && (
            <>
              <div className="section-title">Select a date & time</div>
              {hasNoAvailability ? (
                <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>
                  This host hasn&apos;t set their availability yet. Please check back later.
                </div>
              ) : (
                <div className="flow">
                  <div className="flow-cal">
                    <div className="cal-month-bar">
                      <h2>{format(month, "MMMM yyyy")}</h2>
                      <div className="cal-nav">
                        <button className="btn btn-ghost" onClick={() => setMonth(subMonths(month, 1))} aria-label="Previous month"><ChevronLeft size={18} /></button>
                        <button className="btn btn-ghost" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month"><ChevronRight size={18} /></button>
                      </div>
                    </div>
                    <div className="calendar">
                      {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} className="calendar-head">{d}</div>)}
                      {monthDays.map((d, i) => {
                        if (!d) return <div key={i} />;
                        const past = d < today && !isSameDay(d, today);
                        const dim = !isSameMonth(d, month);
                        const open = openWeekdays.has(d.getDay());
                        const slotsLeft = open && !past && !dim ? availableSlotsForDay(d).length : 0;
                        const disabled = past || dim || !open || slotsLeft === 0;
                        return (
                          <div
                            key={i}
                            className={`calendar-day ${slotsLeft > 0 ? "has-slots" : ""} ${disabled ? "disabled" : ""} ${selectedDate && isSameDay(d, selectedDate) ? "active" : ""}`}
                            onClick={() => { if (!disabled) { setSelectedDate(d); setSelectedTime(null); } }}
                            title={slotsLeft === 0 && open && !past && !dim ? "Fully booked" : undefined}
                          >
                            {format(d, "d")}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="flow-times fade-in">
                      <div className="times-header">{format(selectedDate, "EEE, MMM d")}</div>
                      {dailySlots.length === 0 ? (
                        <div style={{ color: "var(--text-secondary)", fontSize: ".875rem", padding: ".5rem 0" }}>No open slots that day.</div>
                      ) : (
                        <div className="times-list">
                          {dailySlots.map((t) => (
                            <button
                              key={t}
                              className={`time-slot ${selectedTime === t ? "selected" : ""}`}
                              onClick={() => setSelectedTime(t)}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedTime && (
                        <button className="btn btn-primary btn-block" style={{ marginTop: "1rem" }} onClick={() => setStep("form")}>
                          Continue
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {step === "form" && selectedDate && selectedTime && (
            <div className="fade-in" style={{ overflowY: "auto", maxHeight: 560, paddingRight: 4 }}>
              <button className="btn btn-ghost" onClick={() => setStep("pick")} style={{ marginBottom: ".75rem", marginLeft: "-.5rem" }}>
                <ArrowLeft size={16} /> Back
              </button>
              <div className="section-title">Tell us about the meeting</div>

              {error && <div className="form-error" role="alert">{error}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name <span className="req">*</span></label>
                  <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span className="req">*</span></label>
                  <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Purpose of meeting <span className="req">*</span></label>
                <input className="form-input" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Discuss Q3 partnership opportunity" />
                <div className="form-hint">A one-line summary — this is what the host sees first.</div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional notes</label>
                <textarea className="form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything else the host should know? Agenda, links, files…" />
              </div>

              {questions.map((q) => (
                <div key={q.id} className="form-group">
                  <label className="form-label">{q.label}{q.required && <span className="req">*</span>}</label>
                  {q.type === "text" && (
                    <input className="form-input" placeholder={q.placeholder ?? ""} value={answers[q.id] ?? ""}
                           onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                  )}
                  {q.type === "textarea" && (
                    <textarea className="form-textarea" placeholder={q.placeholder ?? ""} value={answers[q.id] ?? ""}
                              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
                  )}
                  {q.type === "select" && (
                    <select className="form-select" value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}>
                      <option value="">— Select —</option>
                      {(q.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                  {q.type === "file" && (
                    <FilePicker file={files[q.id] ?? null} onChange={(f) => setFiles({ ...files, [q.id]: f })} />
                  )}
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">Where should we meet?</label>
                <select className="form-select" value={location} onChange={(e) => setLocation(e.target.value as typeof location)}>
                  <option value="google_meet">Google Meet (link generated automatically)</option>
                  <option value="phone">Phone call</option>
                  <option value="in_person">In person</option>
                </select>
                <div className="form-hint">Microsoft Teams & Zoom — coming soon.</div>
              </div>

              <button className="btn btn-primary btn-block" disabled={submitting} onClick={submit}>
                {submitting ? "Confirming…" : `Confirm booking · ${format(buildSlotDate(selectedDate, selectedTime), "MMM d, h:mm a")}`}
              </button>
            </div>
          )}

          {step === "done" && confirmation && (
            <div className="confirmation fade-in">
              <div className="confirmation-icon"><CheckCircle2 size={32} /></div>
              <h2>You&apos;re booked!</h2>
              <p>A confirmation has been emailed to <strong>{email}</strong>.</p>
              <div className="confirmation-details">
                <div className="confirmation-row"><span>Event</span><span>{event.title}</span></div>
                <div className="confirmation-row"><span>When</span><span>{format(new Date(confirmation.startsAt), "EEEE, MMM d · h:mm a")}</span></div>
                <div className="confirmation-row"><span>With</span><span>{hostName}</span></div>
                {confirmation.meetingLink && (
                  <div className="confirmation-row"><span>Link</span><a href={confirmation.meetingLink} target="_blank" rel="noopener">{confirmation.meetingLink}</a></div>
                )}
                {!confirmation.meetingLink && wantsLink && (
                  <div className="confirmation-row" style={{ color: "var(--text-secondary)" }}>
                    <span>Note</span>
                    <span>{hostName} will follow up with the {location === "google_meet" ? "Google Meet" : "Teams"} link by email shortly.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilePicker({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div>
      {file ? (
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: ".5rem .75rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-sunken)" }}>
          <Paperclip size={14} />
          <div style={{ flex: 1, fontSize: ".875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {file.name} <span style={{ color: "var(--text-tertiary)" }}>· {(file.size / 1024).toFixed(0)} KB</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => onChange(null)} style={{ padding: 4 }}><X size={14} /></button>
        </div>
      ) : (
        <label className="btn btn-outline" style={{ cursor: "pointer", width: "100%" }}>
          <Paperclip size={14} /> Choose file
          <input type="file" hidden onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
        </label>
      )}
      <div className="form-hint">Max 5 MB.</div>
    </div>
  );
}
