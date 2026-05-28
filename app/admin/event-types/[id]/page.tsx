import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getEventTypeById, listQuestions } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import QuestionsEditor from "./QuestionsEditor";

export default async function EventTypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireUser();
  const { id } = await params;
  const event = await getEventTypeById(me.id, id);
  if (!event) notFound();
  const questions = await listQuestions(event.id);
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link href="/admin/event-types" className="btn btn-ghost" style={{ marginLeft: "-.5rem", marginBottom: ".5rem", fontSize: ".8125rem" }}>
            <ArrowLeft size={14} /> Back to event types
          </Link>
          <h1 className="page-title">{event.title} · Form questions</h1>
          <p className="page-subtitle">Anything you ask for here appears on your booking form after the standard fields.</p>
        </div>
      </div>
      <QuestionsEditor eventTypeId={event.id} initial={questions} />
    </div>
  );
}
