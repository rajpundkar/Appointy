import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowRight } from "lucide-react";
import { getUserByUsername, listEventTypes, getOrgById } from "@/lib/db";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) notFound();
  const org = await getOrgById(user.orgId);
  const events = (await listEventTypes(user.id)).filter((e) => e.active);

  return (
    <main className="profile-shell">
      <header className="profile-header">
        <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <h1 className="profile-name">{user.name}</h1>
        {org && <p style={{ color: "var(--text-tertiary)", fontSize: ".8125rem", marginTop: ".25rem" }}>{org.name}</p>}
        <p className="profile-bio">{user.bio ?? "Welcome — pick the meeting that fits, then grab a time."}</p>
      </header>

      <div className="profile-events">
        {events.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            This host hasn't published any event types yet.
          </div>
        )}
        {events.map((e) => (
          <Link key={e.slug} href={`/${user.username}/${e.slug}`} className="profile-event">
            <div>
              <div style={{ fontWeight: 600 }}>{e.title}</div>
              <div className="profile-event-meta">
                <Clock size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                {e.duration} min{e.description ? ` · ${e.description}` : ""}
              </div>
            </div>
            <ArrowRight size={18} color="var(--text-tertiary)" />
          </Link>
        ))}
      </div>
    </main>
  );
}
