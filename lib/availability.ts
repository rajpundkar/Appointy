import type { AvailabilityRule } from "./types";

export function hhmmToMinutes(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function minutesToHHMM(m: number): string {
  const h = Math.floor(m / 60).toString().padStart(2, "0");
  const mm = (m % 60).toString().padStart(2, "0");
  return `${h}:${mm}`;
}

export const SLOT_STEP = 30;

export function slotsForWeekday(
  rules: AvailabilityRule[],
  weekday: number,
  duration: number,
): string[] {
  const out: string[] = [];
  const ranges = rules.filter((r) => r.weekday === weekday);
  for (const r of ranges) {
    const start = hhmmToMinutes(r.startTime);
    const end = hhmmToMinutes(r.endTime);
    for (let t = start; t + duration <= end; t += SLOT_STEP) {
      out.push(minutesToHHMM(t));
    }
  }

  return Array.from(new Set(out)).sort();
}

export function availableWeekdays(rules: AvailabilityRule[]): Set<number> {
  return new Set(rules.map((r) => r.weekday));
}

export const WEEKDAY_LABELS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
export const WEEKDAY_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
