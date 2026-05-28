import { notFound } from "next/navigation";
import {
  getEventType, getOrgById, getUserByUsername, listAvailability,
  listBookedSlotsForEvent, listQuestions,
} from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { isPro } from "@/lib/plan";
import BookingFlow from "./BookingFlow";

export default async function EventPage({
  params,
}: {
  params: Promise<{ username: string; eventType: string }>;
}) {
  const { username, eventType } = await params;
  const host = await getUserByUsername(username);
  if (!host) notFound();
  const event = await getEventType(host.id, eventType);
  if (!event || !event.active) notFound();

  const [taken, rules, questions, me, org] = await Promise.all([
    listBookedSlotsForEvent(host.id, event.slug),
    listAvailability(host.id),
    listQuestions(event.id),
    currentUser(),
    getOrgById(host.orgId),
  ]);

  const isTeammate = !!me && me.orgId === host.orgId && me.id !== host.id && isPro(org);
  const prefill = isTeammate && me ? { name: me.name, email: me.email } : undefined;

  return (
    <BookingFlow
      username={host.username}
      hostName={host.name}
      timezone={host.timezone || "UTC"}
      event={event}
      takenSlots={taken}
      availability={rules}
      questions={questions}
      teammate={isTeammate ? { orgName: org?.name ?? "your team" } : undefined}
      prefill={prefill}
    />
  );
}
