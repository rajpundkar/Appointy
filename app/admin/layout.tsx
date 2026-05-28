import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, LayoutDashboard, Plug, Settings, ExternalLink, Users, ListChecks, CalendarRange, CreditCard, Sparkles } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { getOrgById } from "@/lib/db";
import { isPro } from "@/lib/plan";
import LogoutButton from "./LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await currentUser();
  if (!me) redirect("/login");
  if (!me.emailVerified) redirect("/verify-pending");
  const org = await getOrgById(me.orgId);
  const pro = isPro(org);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Appointy" className="app-logo app-logo-lg" />
          <div className="sidebar-workspace">
            <span className="sidebar-workspace-name">{org?.name ?? "Workspace"}</span>
            <span className={`plan-pill ${pro ? "pro" : ""}`}>{pro ? "Pro" : "Free"}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link href="/admin" className="nav-item"><LayoutDashboard size={16} />Overview</Link>
          <Link href="/admin/meetings" className="nav-item"><Calendar size={16} />Meetings</Link>
          <Link href="/admin/event-types" className="nav-item"><ListChecks size={16} />Event types</Link>
          <Link href="/admin/availability" className="nav-item"><CalendarRange size={16} />Availability</Link>
          <Link href="/admin/integrations" className="nav-item"><Plug size={16} />Integrations</Link>
          {me.role !== "member" && (
            <Link href="/admin/team" className="nav-item">
              <Users size={16} />Team
              {!pro && <span className="nav-lock">Pro</span>}
            </Link>
          )}
          <Link href="/admin/billing" className="nav-item"><CreditCard size={16} />Billing</Link>
          <Link href="/admin/settings" className="nav-item"><Settings size={16} />Settings</Link>
        </nav>
        <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
          {!pro && me.role === "owner" && (
            <Link href="/admin/billing" className="nav-item upgrade">
              <Sparkles size={16} />Upgrade to Pro
            </Link>
          )}
          <Link href={`/${me.username}`} className="nav-item" target="_blank"><ExternalLink size={16} />View my booking page</Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">{org?.name ?? "Admin"}</div>
          <div className="user-pill">
            <div className="user-avatar">{me.name.charAt(0).toUpperCase()}</div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span>{me.name}</span>
              <span style={{ fontSize: ".6875rem", color: "var(--text-tertiary)", textTransform: "capitalize" }}>{me.role}</span>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
