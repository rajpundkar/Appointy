import type { Org, Plan } from "./types";

export const PLAN_LIMITS = {
  free: { maxMembers: 1, allowInvites: false, allowTeamBooking: false },
  pro:  { maxMembers: 100, allowInvites: true, allowTeamBooking: true },
} as const;

export function planFeatures(plan: Plan) {
  return PLAN_LIMITS[plan];
}

export function isPro(org: Pick<Org, "plan"> | null | undefined): boolean {
  return !!org && org.plan === "pro";
}
