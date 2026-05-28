import { getOrgById } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PLAN_LIMITS } from "@/lib/plan";
import PlanSwitcher from "./PlanSwitcher";

export default async function BillingPage() {
  const me = await requireUser();
  const org = await getOrgById(me.orgId);
  const plan = org?.plan ?? "free";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Plan</h1>
          <p className="page-subtitle">You&apos;re on the <strong style={{ textTransform: "capitalize" }}>{plan}</strong> plan.</p>
        </div>
      </div>

      <div className="plan-grid">
        <PlanCard
          name="Free"
          price="$0"
          tagline="One person, your own scheduling page."
          features={[
            "1 user",
            "Unlimited event types",
            "Custom form questions",
            "File upload",
            "Google Meet & Teams links",
          ]}
          highlight={plan === "free"}
        />
        <PlanCard
          name="Organization"
          price="$12"
          priceHint="/ user / month"
          tagline="For teams that book together."
          features={[
            `Up to ${PLAN_LIMITS.pro.maxMembers} users`,
            "Email & link invites",
            "Team page (find & book teammates)",
            "Org-wide meetings view",
            "Priority email support",
          ]}
          highlight={plan === "pro"}
          accent
        />
      </div>

      {me.role === "owner" && <PlanSwitcher currentPlan={plan} />}
      {me.role !== "owner" && (
        <p style={{ marginTop: "1.5rem", color: "var(--text-tertiary)", fontSize: ".8125rem" }}>
          Only the organization owner can change the plan.
        </p>
      )}
    </div>
  );
}

function PlanCard({
  name, price, priceHint, tagline, features, highlight, accent,
}: {
  name: string; price: string; priceHint?: string; tagline: string;
  features: string[]; highlight?: boolean; accent?: boolean;
}) {
  return (
    <div className={`plan-card ${highlight ? "highlight" : ""} ${accent ? "accent" : ""}`}>
      {highlight && <div className="plan-current">Current plan</div>}
      <div className="plan-name">{name}</div>
      <div className="plan-price">{price}<span className="plan-price-hint">{priceHint ?? ""}</span></div>
      <p className="plan-tagline">{tagline}</p>
      <ul className="plan-features">
        {features.map((f) => <li key={f}>{f}</li>)}
      </ul>
    </div>
  );
}
