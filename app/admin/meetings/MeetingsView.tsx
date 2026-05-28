"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, addMonths, endOfMonth, format, isSameDay, isSameMonth, startOfMonth, startOfToday, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, X, Clock, Mail, Phone, Building2, Video, AlertTriangle, Paperclip } from "lucide-react";
import type { Booking } from "@/lib/types";

type View = "calendar" | "table";

export default function MeetingsView({
  bookings,
  hosts = {},
  showHost = false,
}: {
  bookings: Booking[];
  hosts?: Record<string, string>;
  showHost?: boolean;
}) {
  const [view, setView] = useState<View>("calendar");
  const [month, setMonth] = useState<Date>(startOfMonth(startOfToday()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [openBooking, setOpenBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState("");

  const confirmed = useMemo(() => bookings.filter((b) => b.status === "confirmed"), [bookings]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const offset = start.getDay();
    const total = offset + end.getDate();
    const rows = Math.ceil(total / 7) * 7;
    const out: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) out.push(null);
    for (let i = 0; i < end.getDate(); i++) out.push(addDays(start, i));
    while (out.length < rows) out.push(null);
    return out;
  }, [month]);

  function dayBookings(d: Date) {
    return confirmed
      .filter((b) => isSameDay(new Date(b.startsAt), d))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const sorted = [...confirmed].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    if (!q) return sorted;
    return sorted.filter(
      (b) =>
        b.attendee.name.toLowerCase().includes(q) ||
        b.attendee.email.toLowerCase().includes(q) ||
        b.purpose.toLowerCase().includes(q) ||
        b.eventTitle.toLowerCase().includes(q),
    );
  }, [confirmed, filter]);

  const today = startOfToday();

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", gap: "1rem", flexWrap: "wrap" }}>
        <div className="toggle">
          <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>Calendar</button>
          <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>Table</button>
        </div>
        {view === "table" && (
          <input
            className="form-input"
            placeholder="Search name, email, purpose…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ maxWidth: 320 }}
          />
        )}
      </div>

      {view === "calendar" && (
        <>
          <div className="cal-month-bar">
            <h2>{format(month, "MMMM yyyy")}</h2>
            <div className="cal-nav">
              <button className="btn btn-outline" onClick={() => setMonth(startOfMonth(startOfToday()))} style={{ fontSize: ".8125rem" }}>Today</button>
              <button className="btn btn-ghost" onClick={() => setMonth(subMonths(month, 1))}><ChevronLeft size={18} /></button>
              <button className="btn btn-ghost" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="cal-grid">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="cal-head">{d}</div>)}
            {monthDays.map((d, i) => {
              if (!d) return <div key={i} className="cal-cell muted" />;
              const dayItems = dayBookings(d);
              const inMonth = isSameMonth(d, month);
              return (
                <div key={i} className={`cal-cell ${!inMonth ? "muted" : ""}`} onClick={() => dayItems.length && setSelectedDay(d)} style={{ cursor: dayItems.length ? "pointer" : "default" }}>
                  <div className={`cal-day-num ${isSameDay(d, today) ? "today" : ""}`}>{format(d, "d")}</div>
                  {dayItems.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className={`cal-event ${b.location === "microsoft_teams" ? "teams" : ""}`}
                      title={`${b.attendee.name} — ${b.purpose}`}
                      onClick={(e) => { e.stopPropagation(); setOpenBooking(b); }}
                    >
                      {format(new Date(b.startsAt), "h:mm a")} · {b.attendee.name}
                    </div>
                  ))}
                  {dayItems.length > 3 && (
                    <div style={{ fontSize: ".6875rem", color: "var(--text-secondary)", padding: "0 .25rem" }}>+{dayItems.length - 3} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === "table" && (
        <div className="card">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No bookings to show</div>
              <div className="empty-state-desc">Bookings on confirmed slots will appear here.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>{showHost && <th>Host</th>}<th>Guest</th><th>Contact</th><th>Purpose</th>
                  <th>Event</th><th>Where</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{format(new Date(b.startsAt), "MMM d, yyyy")}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: ".8125rem" }}>{format(new Date(b.startsAt), "h:mm a")} · {b.duration}m</div>
                    </td>
                    {showHost && <td style={{ fontSize: ".875rem" }}>{hosts[b.userId] ?? "—"}</td>}
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.attendee.name}</div>
                      {b.attendee.company && <div style={{ color: "var(--text-secondary)", fontSize: ".8125rem" }}>{b.attendee.company}</div>}
                    </td>
                    <td style={{ fontSize: ".8125rem" }}>
                      <div><a href={`mailto:${b.attendee.email}`}>{b.attendee.email}</a></div>
                      {b.attendee.phone && <div style={{ color: "var(--text-secondary)" }}>{b.attendee.phone}</div>}
                    </td>
                    <td style={{ maxWidth: 320 }}>
                      <div>{b.purpose}</div>
                      {b.notes && <div style={{ color: "var(--text-secondary)", fontSize: ".8125rem", marginTop: 4 }}>{b.notes}</div>}
                    </td>
                    <td>{b.eventTitle}</td>
                    <td>
                      {b.location === "google_meet" && <span className="badge badge-meet">Meet</span>}
                      {b.location === "microsoft_teams" && <span className="badge badge-teams">Teams</span>}
                      {b.location === "phone" && <span className="badge">Phone</span>}
                      {b.location === "in_person" && <span className="badge">In person</span>}
                      {b.meetingLinkError && (
                        <span className="badge" title={b.meetingLinkError} style={{ marginLeft: 4, background: "var(--warning-soft)", color: "#78350f", borderColor: "#fde68a" }}>
                          <AlertTriangle size={10} /> No link
                        </span>
                      )}
                    </td>
                    <td><button className="btn btn-ghost" onClick={() => setOpenBooking(b)} style={{ fontSize: ".8125rem" }}>Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {selectedDay && (
        <Modal onClose={() => setSelectedDay(null)} title={format(selectedDay, "EEEE, MMMM d")}>
          {dayBookings(selectedDay).map((b) => (
            <DayRow key={b.id} b={b} onOpen={() => { setSelectedDay(null); setOpenBooking(b); }} />
          ))}
        </Modal>
      )}

      {openBooking && (
        <Modal onClose={() => setOpenBooking(null)} title={openBooking.eventTitle}>
          <BookingDetails b={openBooking} />
        </Modal>
      )}
    </>
  );
}

function DayRow({ b, onOpen }: { b: Booking; onOpen: () => void }) {
  return (
    <button onClick={onOpen} style={{ display: "flex", width: "100%", padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", background: "var(--bg-secondary)", textAlign: "left", marginBottom: ".5rem", cursor: "pointer", gap: ".75rem", alignItems: "center" }}>
      <div style={{ fontWeight: 600, fontSize: ".875rem", minWidth: 70 }}>{format(new Date(b.startsAt), "h:mm a")}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{b.attendee.name}</div>
        <div style={{ color: "var(--text-secondary)", fontSize: ".8125rem" }}>{b.purpose}</div>
      </div>
      <span className="badge">{b.duration}m</span>
    </button>
  );
}

function BookingDetails({ b }: { b: Booking }) {
  return (
    <div style={{ fontSize: ".875rem" }}>
      <Row icon={<Clock size={14} />} label="When" value={`${format(new Date(b.startsAt), "EEEE, MMM d · h:mm a")} (${b.duration}m)`} />
      <Row icon={<Mail size={14} />} label="Email" value={<a href={`mailto:${b.attendee.email}`}>{b.attendee.email}</a>} />
      {b.attendee.phone && <Row icon={<Phone size={14} />} label="Phone" value={b.attendee.phone} />}
      {b.attendee.company && <Row icon={<Building2 size={14} />} label="Company" value={b.attendee.company} />}
      {b.meetingLink && <Row icon={<Video size={14} />} label="Link" value={<a href={b.meetingLink} target="_blank" rel="noopener">{b.meetingLink}</a>} />}
      {!b.meetingLink && (b.location === "google_meet" || b.location === "microsoft_teams") && (
        <RetryLink bookingId={b.id} provider={b.location} />
      )}
      {!b.meetingLink && b.meetingLinkError && (
        <Row
          icon={<AlertTriangle size={14} color="var(--warning)" />}
          label="Link error"
          value={<span style={{ color: "#78350f" }}>{b.meetingLinkError}</span>}
        />
      )}
      <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--bg-sunken)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: ".75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: ".375rem" }}>Purpose</div>
        <div>{b.purpose}</div>
        {b.notes && (
          <>
            <div style={{ fontSize: ".75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: ".04em", marginTop: "1rem", marginBottom: ".375rem" }}>Notes</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{b.notes}</div>
          </>
        )}
        {b.answers && Object.keys(b.answers).length > 0 && (
          <>
            <div style={{ fontSize: ".75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: ".04em", marginTop: "1rem", marginBottom: ".375rem" }}>Form answers</div>
            <table style={{ width: "100%", fontSize: ".875rem" }}>
              <tbody>
                {Object.entries(b.answers).map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ color: "var(--text-secondary)", padding: "4px 8px 4px 0", verticalAlign: "top", width: 160 }}>{k}</td>
                    <td style={{ padding: "4px 0", whiteSpace: "pre-wrap" }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {b.attachments && b.attachments.length > 0 && (
          <>
            <div style={{ fontSize: ".75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: ".04em", marginTop: "1rem", marginBottom: ".375rem" }}>Attachments</div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".375rem" }}>
              {b.attachments.map((a, i) => {
                const href = `data:${a.contentType};base64,${a.contentBase64}`;
                return (
                  <a key={i} href={href} download={a.filename} style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", color: "var(--accent)", fontSize: ".875rem" }}>
                    <Paperclip size={13} /> {a.filename} <span style={{ color: "var(--text-tertiary)" }}>· {(a.size / 1024).toFixed(0)} KB</span>
                  </a>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RetryLink({ bookingId, provider }: { bookingId: string; provider: "google_meet" | "microsoft_teams" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  async function retry() {
    setBusy(true); setError(null);
    const res = await fetch(`/api/bookings/${bookingId}/retry-link`, { method: "POST" });
    setBusy(false);
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.ok) {
      setError(j.error ?? "Could not generate link.");
      return;
    }
    setLink(j.meetingLink ?? null);
    router.refresh();
  }

  if (link) {
    return (
      <div style={{ marginTop: ".75rem", padding: ".875rem 1rem", background: "var(--success-soft)", border: "1px solid #bbf7d0", borderRadius: 10, fontSize: ".8125rem", color: "#166534" }}>
        Link generated! <a href={link} target="_blank" rel="noopener" style={{ wordBreak: "break-all" }}>{link}</a>
      </div>
    );
  }

  return (
    <div style={{ marginTop: ".75rem", padding: ".875rem 1rem", background: "var(--warning-soft)", border: "1px solid #fde68a", borderRadius: 10 }}>
      <div style={{ fontSize: ".8125rem", color: "#78350f", marginBottom: ".5rem" }}>
        No {provider === "google_meet" ? "Google Meet" : "Teams"} link on this booking yet. If you&apos;ve just fixed your integration, retry now and we&apos;ll re-send the confirmation email with the link.
      </div>
      <button className="btn btn-primary" onClick={retry} disabled={busy} style={{ fontSize: ".8125rem", padding: ".4375rem .875rem" }}>
        {busy ? "Generating…" : "Generate link now"}
      </button>
      {error && <div className="form-error" style={{ marginTop: ".5rem" }}>{error}</div>}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: ".75rem", padding: ".5rem 0", borderBottom: "1px solid var(--border-color)" }}>
      <div style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: ".375rem", minWidth: 80 }}>{icon}{label}</div>
      <div style={{ flex: 1 }}>{value}</div>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "grid", placeItems: "center", padding: "1rem", zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 560, padding: "1.5rem", maxHeight: "85vh", overflow: "auto", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ fontWeight: 600, fontSize: "1.0625rem" }}>{title}</div>
          <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
