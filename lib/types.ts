export type Plan = "free" | "pro";

export type Org = {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  createdAt: string;
};

export type Role = "owner" | "admin" | "member";

export type User = {
  id: string;
  orgId: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  timezone: string;
  bio?: string;
  emailVerified: boolean;
  createdAt: string;
};

export type AvailabilityRule = {
  weekday: number;
  startTime: string;
  endTime: string;
};

export type QuestionType = "text" | "textarea" | "select" | "file";

export type Question = {
  id: string;
  eventTypeId: string;
  ord: number;
  label: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
};

export type Invite = {
  token: string;
  orgId: string;
  email?: string;
  role: Role;
  expiresAt: string;
  used: boolean;
  createdAt: string;
};

export type Attachment = {
  filename: string;
  contentType: string;
  size: number;

  contentBase64: string;
};

export type EventType = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  duration: number;
  description?: string;
  active: boolean;
};

export type Booking = {
  id: string;
  userId: string;
  orgId: string;
  eventTypeId: string;
  eventSlug: string;
  eventTitle: string;
  duration: number;
  startsAt: string;
  endsAt: string;
  timezone: string;
  attendee: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  purpose: string;
  notes?: string;

  answers?: Record<string, string>;

  attachments?: Attachment[];
  location: "google_meet" | "microsoft_teams" | "in_person" | "phone";
  meetingLink?: string;
  meetingLinkError?: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
};

export type IntegrationProvider = "google" | "microsoft";

export type Integration = {
  userId: string;
  provider: IntegrationProvider;
  connected: boolean;
  account?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  connectedAt?: string;
};
