import { listEventTypes } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import EventTypesEditor from "./EventTypesEditor";

export default async function EventTypesPage() {
  const me = await requireUser();
  const events = await listEventTypes(me.id);
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Event types</h1>
          <p className="page-subtitle">Create, rename, retime, and toggle the meetings people can book with you.</p>
        </div>
      </div>
      <EventTypesEditor initial={events} username={me.username} />
    </div>
  );
}
