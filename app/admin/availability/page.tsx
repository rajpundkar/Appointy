import { listAvailability } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import AvailabilityEditor from "./AvailabilityEditor";

export default async function AvailabilityPage() {
  const me = await requireUser();
  const rules = await listAvailability(me.id);
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Availability</h1>
          <p className="page-subtitle">Set which days and hours you're open. People can only book inside these windows.</p>
        </div>
      </div>
      <AvailabilityEditor initial={rules} timezone={me.timezone} />
    </div>
  );
}
