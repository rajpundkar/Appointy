import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getOrgById } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isPro } from "@/lib/plan";

export default async function SettingsPage() {
  const me = await requireUser();
  const org = await getOrgById(me.orgId);
  const pro = isPro(org);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Your profile and organization.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 820, marginBottom: "1.5rem" }}>
        <div className="card-header">
          <div className="card-title">Organization</div>
          <span className={`plan-pill ${pro ? "pro" : ""}`} style={{ marginLeft: 0 }}>{pro ? "Pro" : "Free"}</span>
        </div>
        <table className="table">
          <tbody>
            <tr><td style={{ width: 200, color: "var(--text-secondary)" }}>Name</td><td>{org?.name ?? "—"}</td></tr>
            <tr><td style={{ color: "var(--text-secondary)" }}>Slug</td><td><code>{org?.slug ?? "—"}</code></td></tr>
            <tr><td style={{ color: "var(--text-secondary)" }}>Plan</td>
              <td>
                <span style={{ textTransform: "capitalize" }}>{org?.plan ?? "free"}</span>
                {!pro && me.role === "owner" && (
                  <Link href="/admin/billing" className="btn btn-ghost" style={{ marginLeft: "1rem", color: "var(--accent)", fontSize: ".8125rem" }}>
                    <Sparkles size={13} /> Upgrade
                  </Link>
                )}
              </td>
            </tr>
            <tr><td style={{ color: "var(--text-secondary)" }}>Created</td><td>{org?.createdAt?.split("T")[0] ?? "—"}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card" style={{ maxWidth: 820, marginBottom: "1.5rem" }}>
        <div className="card-header"><div className="card-title">Your profile</div></div>
        <table className="table">
          <tbody>
            <tr><td style={{ width: 200, color: "var(--text-secondary)" }}>Name</td><td>{me.name}</td></tr>
            <tr><td style={{ color: "var(--text-secondary)" }}>Email</td><td>{me.email} {me.emailVerified ? <span className="badge badge-success" style={{ marginLeft: 8 }}>Verified</span> : <span className="badge" style={{ marginLeft: 8 }}>Unverified</span>}</td></tr>
            <tr><td style={{ color: "var(--text-secondary)" }}>Username</td><td>{me.username} <span style={{ color: "var(--text-tertiary)" }}>· /{me.username}</span></td></tr>
            <tr><td style={{ color: "var(--text-secondary)" }}>Timezone</td><td>{me.timezone}</td></tr>
            <tr><td style={{ color: "var(--text-secondary)" }}>Role</td><td style={{ textTransform: "capitalize" }}>{me.role}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card" style={{ maxWidth: 820 }}>
        <div className="card-header"><div className="card-title">Manage</div></div>
        <div style={{ padding: "1rem 1.25rem", display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
          <Link href="/admin/event-types" className="btn btn-outline">Event types</Link>
          <Link href="/admin/availability" className="btn btn-outline">Availability</Link>
          <Link href="/admin/integrations" className="btn btn-outline">Integrations</Link>
          <Link href="/admin/billing" className="btn btn-outline">Billing</Link>
        </div>
      </div>
    </div>
  );
}
