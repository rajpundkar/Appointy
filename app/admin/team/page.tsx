import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Sparkles, Calendar, ExternalLink } from "lucide-react";
import { getOrgById, listOrgInvites, listOrgMembers } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isPro } from "@/lib/plan";
import TeamInviteCard from "./TeamInviteCard";

export default async function TeamPage() {
  const me = await requireUser();
  if (me.role === "member") redirect("/admin");
  const org = await getOrgById(me.orgId);
  const pro = isPro(org);
  const members = await listOrgMembers(me.orgId);
  const invites = await listOrgInvites(me.orgId);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const decoratedInvites = invites
    .filter((i) => !i.used && new Date(i.expiresAt) > new Date())
    .map((i) => ({ ...i, link: `${base}/invite/${i.token}` }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">Everyone in <strong>{org?.name}</strong>. Invite by email or share a link.</p>
        </div>
      </div>

      {!pro && (
        <div className="upgrade-callout">
          <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
            <div className="upgrade-icon"><Sparkles size={18} /></div>
            <div>
              <div style={{ fontWeight: 600 }}>Team is an Organization plan feature</div>
              <div style={{ color: "var(--text-secondary)", fontSize: ".875rem", marginTop: 2 }}>
                Free plan supports a single user. Upgrade to invite teammates and book inside your team.
              </div>
            </div>
          </div>
          <Link href="/admin/billing" className="btn btn-primary"><Sparkles size={14} /> Upgrade</Link>
        </div>
      )}

      {pro && <TeamInviteCard pending={decoratedInvites} />}

      <div className="card" style={{ maxWidth: 1000, marginTop: "1.5rem" }}>
        <div className="card-header"><div className="card-title">Members ({members.length})</div></div>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Booking page</th><th>Role</th><th>Timezone</th><th></th></tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td style={{ fontWeight: 500 }}>{m.name}{m.id === me.id && <span style={{ marginLeft: 6, color: "var(--text-tertiary)", fontSize: ".8125rem" }}>(you)</span>}</td>
                <td><a href={`mailto:${m.email}`}>{m.email}</a></td>
                <td><a href={`/${m.username}`} target="_blank" rel="noopener"><code>/{m.username}</code></a></td>
                <td><span className="badge" style={{ textTransform: "capitalize" }}>{m.role}</span></td>
                <td style={{ fontSize: ".8125rem", color: "var(--text-secondary)" }}>{m.timezone}</td>
                <td>
                  {m.id === me.id ? (
                    <span style={{ color: "var(--text-tertiary)", fontSize: ".8125rem" }}>—</span>
                  ) : pro ? (
                    <Link href={`/${m.username}`} className="btn btn-outline" style={{ fontSize: ".8125rem", padding: ".4375rem .75rem" }}>
                      <Calendar size={13} /> Book
                    </Link>
                  ) : (
                    <Link href={`/${m.username}`} target="_blank" className="btn btn-ghost" style={{ fontSize: ".8125rem" }}>
                      <ExternalLink size={13} /> View
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "1rem", color: "var(--text-tertiary)", fontSize: ".8125rem" }}>
        Joined dates are visible in each member&apos;s profile.{" "}
        {members.length > 0 && `First joined ${format(new Date(members[0].createdAt), "MMM d, yyyy")}.`}
      </p>
    </div>
  );
}
