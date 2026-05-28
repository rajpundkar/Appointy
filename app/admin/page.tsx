import Link from "next/link";
import { format, isToday, isAfter, startOfDay } from "date-fns";
import { Calendar, Users, Clock, ArrowRight } from "lucide-react";
import { listBookings } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export default async function AdminOverview() {
  const me = await requireUser();
  const bookings = await listBookings(me.id);
  const now = new Date();
  const upcoming = bookings
    .filter((b) => b.status === "confirmed" && isAfter(new Date(b.startsAt), now))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const todayCount = bookings.filter((b) => b.status === "confirmed" && isToday(new Date(b.startsAt))).length;
  const weekStart = startOfDay(now);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  const weekCount = bookings.filter((b) => {
    const d = new Date(b.startsAt);
    return b.status === "confirmed" && d >= weekStart && d < weekEnd;
  }).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {me.name.split(" ")[0]}</h1>
          <p className="page-subtitle">Your scheduling at a glance.</p>
        </div>
        <Link href={`/${me.username}`} target="_blank" className="btn btn-outline">View booking page →</Link>
      </div>

      <div className="stats">
        <div className="stat"><div className="stat-label">Total bookings</div><div className="stat-value">{bookings.length}</div></div>
        <div className="stat"><div className="stat-label">Today</div><div className="stat-value">{todayCount}</div></div>
        <div className="stat"><div className="stat-label">Next 7 days</div><div className="stat-value">{weekCount}</div></div>
        <div className="stat"><div className="stat-label">Upcoming</div><div className="stat-value">{upcoming.length}</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Upcoming meetings</div>
          <Link href="/admin/meetings" className="btn btn-ghost" style={{ fontSize: ".8125rem" }}>View all <ArrowRight size={14} /></Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-state">
            <Calendar size={28} />
            <div className="empty-state-title">No upcoming bookings yet</div>
            <div className="empty-state-desc">Share your link to start collecting bookings: <code>/{me.username}</code></div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>When</th><th>Guest</th><th>Purpose</th><th>Event</th><th>Where</th></tr>
            </thead>
            <tbody>
              {upcoming.slice(0, 8).map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{format(new Date(b.startsAt), "MMM d")}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: ".8125rem" }}><Clock size={11} style={{ verticalAlign: "-1px" }} /> {format(new Date(b.startsAt), "h:mm a")}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{b.attendee.name}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: ".8125rem" }}>{b.attendee.email}</div>
                  </td>
                  <td style={{ maxWidth: 280 }}>{b.purpose}</td>
                  <td><span className="badge"><Users size={11} /> {b.duration}m</span></td>
                  <td>
                    {b.location === "google_meet" && <span className="badge badge-meet">Google Meet</span>}
                    {b.location === "microsoft_teams" && <span className="badge badge-teams">Teams</span>}
                    {b.location === "phone" && <span className="badge">Phone</span>}
                    {b.location === "in_person" && <span className="badge">In person</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
