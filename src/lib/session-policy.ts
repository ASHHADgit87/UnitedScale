import type { AppRole } from "@/lib/permissions";

export interface SessionPolicy {
  idleMs: number;

  maxMs: number;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const SESSION_POLICIES: Record<AppRole, SessionPolicy> = {
  ADMIN: { idleMs: 15 * MINUTE, maxMs: 8 * HOUR },
  MANAGER: { idleMs: 30 * MINUTE, maxMs: 12 * HOUR },
  TECHNICIAN: { idleMs: 30 * MINUTE, maxMs: 12 * HOUR },
};

export const FALLBACK_POLICY: SessionPolicy = SESSION_POLICIES.TECHNICIAN;

export const getSessionPolicy = (role: AppRole | null): SessionPolicy =>
  role ? SESSION_POLICIES[role] : FALLBACK_POLICY;

export const WARNING_MS = 2 * MINUTE;

export const MAX_WARNING_MS = 5 * MINUTE;

export const HEARTBEAT_MS = 60 * 1000;

export const TOUCH_THROTTLE_MS = 30 * 1000;

export const BOOTSTRAP_GRACE_MS = 2 * MINUTE;

export const SESSION_COOKIE = "us_session";
export const SESSION_EXPIRES_HEADER = "x-session-expires-at";

export type SessionEndReason = "idle" | "max" | "invalid";

export const SESSION_END_MESSAGES: Record<SessionEndReason, string> = {
  idle: "You were signed out because of inactivity. Please sign in again.",
  max: "Your session reached its maximum length. Please sign in again to continue.",
  invalid: "We could not verify your session. Please sign in again.",
};

export const isSessionEndReason = (value: unknown): value is SessionEndReason =>
  value === "idle" || value === "max" || value === "invalid";
