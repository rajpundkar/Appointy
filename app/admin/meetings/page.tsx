import { listBookings, listOrgBookings, listOrgMembers } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import MeetingsView from "./MeetingsView";

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const me = await requireUser();
  const sp = await searchParams;
  const orgScope = sp.scope === "org" && me.role !== "member";
  const bookings = orgScope ? await listOrgBookings(me.orgId) : await listBookings(me.id);

  let hosts: Record<string, string> = {};
  if (orgScope) {
    const members = await listOrgMembers(me.orgId);
    hosts = Object.fromEntries(members.map((m) => [m.id, m.name]));
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">
            {orgScope ? "All bookings across the organization." : "Your bookings — calendar or table view, with guest details."}
          </p>
        </div>
        {me.role !== "member" && (
          <div className="toggle">
            <a href="/admin/meetings" className={!orgScope ? "active" : ""} style={linkBtn}>Just me</a>
            <a href="/admin/meetings?scope=org" className={orgScope ? "active" : ""} style={linkBtn}>Whole org</a>
          </div>
        )}
      </div>
      <MeetingsView bookings={bookings} hosts={hosts} showHost={orgScope} />
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  padding: ".375rem .75rem", borderRadius: "calc(var(--radius-md) - 2px)",
  fontSize: ".8125rem", fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none",
};
