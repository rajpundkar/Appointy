import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays, Mail, Video, Users, Sparkles, FileText, Globe2, ShieldCheck,
  ArrowRight, Check,
} from "lucide-react";
import { currentUser } from "@/lib/auth";

export default async function Home() {
  const me = await currentUser();
  if (me) redirect(me.emailVerified ? "/admin" : "/verify-pending");

  return (
    <div className="lp-shell">

      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-logo" aria-label="Appointy home">
            <img src="/logo.png" alt="Appointy" className="app-logo app-logo-marketing" />
          </Link>
          <div className="lp-nav-links">
            <Link href="#features" className="lp-nav-link">Features</Link>
            <Link href="#pricing" className="lp-nav-link">Pricing</Link>
            <Link href="https://github.com" target="_blank" className="lp-nav-link">GitHub</Link>
            <Link href="/login" className="btn btn-ghost">Sign in</Link>
            <Link href="/signup" className="btn btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-pill">
            <span className="lp-pill-dot" />
            Open-source · Free forever for one
          </div>
          <h1 className="lp-h1">
            Scheduling that <em>just clicks.</em>
          </h1>
          <p className="lp-sub">
            A polished, customisable booking page for individuals and teams.
            Real availability, host-defined form questions, file uploads, and
            automatic Google Meet / Teams links — all powered by your own stack.
          </p>
          <div className="lp-cta">
            <Link href="/signup" className="btn btn-accent btn-lg">
              Start scheduling — free <ArrowRight size={16} />
            </Link>
            <Link href="#features" className="btn btn-outline btn-lg">
              See features
            </Link>
          </div>
          <div className="lp-tiny">No credit card · 60-second setup</div>

          <BookingMockup />
        </div>
      </section>

      <section className="lp-section" id="features">
        <div className="lp-section-inner">
          <div className="lp-section-eyebrow">Built for real teams</div>
          <h2 className="lp-section-title">Everything you need.<br />Nothing you don&apos;t.</h2>
          <p className="lp-section-sub">
            Real scheduling tools, designed cleanly and shipped open-source.
          </p>
          <div className="lp-features-grid">
            <Feature icon={<CalendarDays size={22} />} title="Real availability"
                     desc="Per-weekday windows that respect your timezone. Booked slots disappear automatically." />
            <Feature icon={<FileText size={22} />} title="Custom form + uploads"
                     desc="Add any question to the booking form. Accept files up to 5 MB — sent straight to your inbox." />
            <Feature icon={<Video size={22} />} title="Auto video link"
                     desc="Google Meet links generated per host with token refresh built in. Teams & Zoom coming soon." />
            <Feature icon={<Mail size={22} />} title="Beautiful emails"
                     desc="Polished confirmations with a Join button. Powered by Resend with verified-domain delivery." />
            <Feature icon={<Users size={22} />} title="Teams & invites"
                     desc="Invite teammates by email or share link. Book inside your org in two clicks." />
            <Feature icon={<ShieldCheck size={22} />} title="Yours to host"
                     desc="Open-source. Bring your own Turso DB. No vendor lock-in, no tracking." />
            <Feature icon={<Globe2 size={22} />} title="One link per person"
                     desc="Each user gets /username, with their own profile, event types, and availability." />
            <Feature icon={<Sparkles size={22} />} title="Polished out of the box"
                     desc="Designed pixel-by-pixel. No half-rendered modals, no spinner-zombies." />
          </div>
        </div>
      </section>

      <section className="lp-section" id="pricing" style={{ paddingTop: 0 }}>
        <div className="lp-section-inner">
          <div className="lp-section-eyebrow">Pricing</div>
          <h2 className="lp-section-title">Simple, honest pricing.</h2>
          <p className="lp-section-sub">Start free as long as you like. Upgrade when you bring your team.</p>

          <div className="lp-pricing-grid">
            <PlanCard
              name="Free"
              price="$0"
              hint=""
              tagline="For individuals."
              cta="Get started"
              ctaHref="/signup"
              features={[
                "1 user",
                "Unlimited event types & bookings",
                "Custom form questions",
                "File upload (5 MB)",
                "Google Meet & Teams",
                "Your own /username page",
              ]}
            />
            <PlanCard
              featured
              name="Organization"
              price="$12"
              hint="/ user / month"
              tagline="For teams that schedule together."
              cta="Start free, upgrade anytime"
              ctaHref="/signup"
              features={[
                "Everything in Free",
                "Up to 100 users",
                "Email & link invites",
                "Org-wide meetings view",
                "Team-internal booking",
                "Priority support",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="lp-cta-end">
        <h2>Your time is too valuable for &ldquo;does Thursday work?&rdquo;</h2>
        <p>Get up and running in 60 seconds. Free for one — forever.</p>
        <div className="lp-cta" style={{ marginTop: "1.75rem" }}>
          <Link href="/signup" className="btn btn-accent btn-lg">
            Create your workspace <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="lp-footer">
        <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", marginBottom: "1rem", fontSize: ".8125rem", flexWrap: "wrap" }}>
          <Link href="https://github.com/rajpundkar/Appointy" target="_blank" style={{ color: "var(--text-secondary)" }}>GitHub</Link>
          <Link href="#pricing" style={{ color: "var(--text-secondary)" }}>Pricing</Link>
          <Link href="/login" style={{ color: "var(--text-secondary)" }}>Sign in</Link>
          <Link href="/privacy" style={{ color: "var(--text-secondary)" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "var(--text-secondary)" }}>Terms</Link>
        </div>
        <div>© {new Date().getFullYear()} Appointy · Open-source scheduling</div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="lp-feature">
      <div className="lp-feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function PlanCard({
  name, price, hint, tagline, features, featured, cta, ctaHref,
}: {
  name: string; price: string; hint: string; tagline: string;
  features: string[]; featured?: boolean; cta: string; ctaHref: string;
}) {
  return (
    <div className={`lp-plan ${featured ? "featured" : ""}`}>
      {featured && <span className="lp-plan-badge">Most popular</span>}
      <div className="lp-plan-name">{name}</div>
      <div className="lp-plan-price">{price}<span className="lp-plan-hint">{hint}</span></div>
      <p className="lp-plan-desc">{tagline}</p>
      <ul className="lp-plan-list">
        {features.map((f) => <li key={f}><span>{f}</span></li>)}
      </ul>
      <Link href={ctaHref} className={`btn ${featured ? "btn-accent" : "btn-outline"} btn-block`}>
        {cta} {featured && <ArrowRight size={14} />}
      </Link>
    </div>
  );
}

function BookingMockup() {

  return (
    <div className="lp-preview" aria-hidden>
      <div className="lp-preview-bar">
        <span className="lp-preview-dot" />
        <span className="lp-preview-dot" />
        <span className="lp-preview-dot" />
      </div>
      <div className="lp-preview-body">
        <aside className="lp-preview-side">
          <div className="lp-preview-avatar">A</div>
          <div className="lp-preview-host">Alex Chen · Acme</div>
          <div className="lp-preview-title">30-min discovery call</div>
          <div className="lp-preview-meta">
            <div>⏱ 30 min</div>
            <div>🌐 Asia/Calcutta</div>
            <div>📹 Google Meet</div>
          </div>
        </aside>
        <main className="lp-preview-main">
          <div className="lp-preview-cal">
            <div className="lp-preview-cal-h">May 2026</div>
            <div className="lp-mini-cal">
              {["S","M","T","W","T","F","S"].map((d, i) =>
                <div key={`h-${i}`} style={{ fontSize: ".625rem", color: "var(--text-tertiary)", fontWeight: 600, padding: "2px 0", textAlign: "center" }}>{d}</div>)}
              {Array.from({ length: 31 }, (_, i) => {
                const n = i + 1;
                const dim = n < 4;
                const avail = !dim && [4, 5, 6, 11, 12, 13, 18, 19, 20, 25, 26, 27].includes(n);
                const sel = n === 12;
                return (
                  <div key={n} className={`lp-mini-d ${dim ? "dim" : ""} ${avail ? "avail" : ""} ${sel ? "selected" : ""}`}>{n}</div>
                );
              })}
            </div>
          </div>
          <div className="lp-preview-times">
            <div className="lp-preview-cal-h">Mon, May 12</div>
            {["09:00","09:30","10:00"].map((t) =>
              <div key={t} className={`lp-mini-t ${t === "09:30" ? "selected" : ""}`}>{t}</div>
            )}
            <div className="lp-mini-cta">Continue <Check size={12} style={{ verticalAlign: "-1px", marginLeft: 4 }} /></div>
          </div>
        </main>
      </div>
    </div>
  );
}
