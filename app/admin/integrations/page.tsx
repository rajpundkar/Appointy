import { Check, Plus, Video, AlertTriangle, Clock } from "lucide-react";
import { listIntegrations, listBookings } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import DisconnectButton from "./DisconnectButton";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const me = await requireUser();
  const sp = await searchParams;
  const integrations = await listIntegrations(me.id);
  const google = integrations.find((i) => i.provider === "google");

  const bookings = await listBookings(me.id);
  const recentFailure = bookings.slice().reverse().find((b) => b.meetingLinkError);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Connect your video tools — meeting links get added to confirmations automatically. These are personal to your account.</p>
        </div>
      </div>

      {sp.connected === "google" && (
        <div className="form-success" style={{ maxWidth: 820 }}>
          Google connected — Meet links will be generated for your new bookings.
        </div>
      )}
      {sp.error && (
        <div className="form-error" style={{ maxWidth: 820 }}>Could not complete connection: {sp.error}</div>
      )}

      {recentFailure && (
        <div className="warn-banner" style={{ maxWidth: 820 }}>
          <AlertTriangle size={18} />
          <div>
            <strong>A recent meeting link couldn&apos;t be generated.</strong>
            <div style={{ fontSize: ".875rem", marginTop: 2 }}>
              {recentFailure.meetingLinkError}
            </div>
          </div>
        </div>
      )}

      <div className="integrations">
        <ActiveCard
          name="Google Meet"
          desc="Generates a Google Meet link and adds the event to your Google Calendar."
          logo={<svg width="26" height="26" viewBox="0 0 24 24" fill="#00897B"><path d="M19 8.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5l4 3.5v-14l-4 3.5Z"/></svg>}
          connected={!!google?.connected}
          account={google?.account}
          connectUrl="/api/integrations/google"
        />
        <ComingSoonCard
          name="Microsoft Teams"
          desc="Auto-generate Microsoft Teams meeting links via your Microsoft 365 account."
          logo={<Video size={24} color="#5b21b6" />}
        />
        <ComingSoonCard
          name="Zoom"
          desc="Auto-generate Zoom meeting links for each booking."
          logo={<Video size={24} color="#2D8CFF" />}
        />
      </div>

    </div>
  );
}

function ActiveCard({
  name, desc, logo, connected, account, connectUrl,
}: {
  name: string; desc: string; logo: React.ReactNode;
  connected: boolean; account?: string; connectUrl: string;
}) {
  return (
    <div className="integration">
      <div className="integration-logo">{logo}</div>
      <div className="integration-body">
        <div className="integration-title">{name}</div>
        <div className="integration-desc">{desc}</div>
        {connected && account && <div className="integration-connected">Connected as {account}</div>}
      </div>
      <div style={{ display: "flex", gap: ".5rem" }}>
        {connected ? (
          <>
            <span className="btn btn-outline" style={{ color: "var(--success)", borderColor: "var(--success)", cursor: "default" }}>
              <Check size={16} /> Connected
            </span>
            <DisconnectButton provider="google" />
          </>
        ) : (
          <a className="btn btn-primary" href={connectUrl}><Plus size={16} /> Connect</a>
        )}
      </div>
    </div>
  );
}

function ComingSoonCard({
  name, desc, logo,
}: {
  name: string; desc: string; logo: React.ReactNode;
}) {
  return (
    <div className="integration" style={{ opacity: 0.7 }}>
      <div className="integration-logo">{logo}</div>
      <div className="integration-body">
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <div className="integration-title">{name}</div>
          <span className="badge" style={{ background: "var(--accent-soft-2)", color: "var(--text-primary)", borderColor: "var(--border-strong)" }}>
            <Clock size={10} /> Coming soon
          </span>
        </div>
        <div className="integration-desc">{desc}</div>
      </div>
      <div>
        <button className="btn btn-outline" disabled style={{ cursor: "not-allowed" }}>
          Notify me
        </button>
      </div>
    </div>
  );
}
