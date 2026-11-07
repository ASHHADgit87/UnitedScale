"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/permissions";
import {
  HEARTBEAT_MS,
  MAX_WARNING_MS,
  SESSION_EXPIRES_HEADER,
  WARNING_MS,
  getSessionPolicy,
  isSessionEndReason,
  type SessionEndReason,
} from "@/lib/session-policy";

interface SessionGuardProps {
  role: AppRole;
}

interface Warning {
  reason: "idle" | "max";
  endsAt: number;
  secondsLeft: number;
}

const ACTIVITY_KEY = "us:last-activity";
const END_KEY = "us:session-end";
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
  "scroll",
] as const;

const readStorage = (key: string) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const writeStorage = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
};

const toLoginUrl = (reason: SessionEndReason | null) =>
  reason ? `/login?reason=${reason}` : "/login";

const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function SessionGuard({ role }: SessionGuardProps) {
  const { idleMs } = getSessionPolicy(role);
  const [warning, setWarning] = useState<Warning | null>(null);

  const lastActivityRef = useRef(Date.now());
  const lastBeatRef = useRef(0);
  const lastWriteRef = useRef(0);
  const expiresAtRef = useRef<number | null>(null);
  const endingRef = useRef(false);
  const warningRef = useRef<Warning | null>(null);
  const maxDismissedRef = useRef(false);

  const endSession = useCallback(async (reason: SessionEndReason | null) => {
    if (endingRef.current) return;
    endingRef.current = true;

    writeStorage(END_KEY, JSON.stringify({ reason, at: Date.now() }));
    try {
      await createClient().auth.signOut({ scope: "local" });
    } catch {
    } finally {
      window.location.replace(toLoginUrl(reason));
    }
  }, []);

  const markActive = useCallback((force = false) => {
    const now = Date.now();
    if (!force && now - lastActivityRef.current < 1000) return;
    lastActivityRef.current = now;
    if (force || now - lastWriteRef.current > 5000) {
      lastWriteRef.current = now;
      writeStorage(ACTIVITY_KEY, String(now));
    }
  }, []);

  const beat = useCallback(async () => {
    lastBeatRef.current = Date.now();
    try {
      const res = await fetch("/api/session", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (res.status === 401) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        const reasons: Record<string, SessionEndReason> = {
          SESSION_IDLE: "idle",
          SESSION_MAX: "max",
          SESSION_INVALID: "invalid",
        };
        void endSession(body?.error ? (reasons[body.error] ?? null) : null);
        return;
      }

      const expires = Number(res.headers.get(SESSION_EXPIRES_HEADER));
      if (res.ok && Number.isFinite(expires) && expires > 0) {
        const serverNow = Date.parse(res.headers.get("date") ?? "");
        const skew = Number.isNaN(serverNow) ? 0 : serverNow - Date.now();
        expiresAtRef.current = expires - skew;
      }
    } catch {}
  }, [endSession]);

  useEffect(() => {
    markActive(true);
    void beat();

    const tick = () => {
      if (endingRef.current) return;

      const now = Date.now();
      const idleDeadline = lastActivityRef.current + idleMs;
      const maxDeadline = expiresAtRef.current;

      if (maxDeadline !== null && now >= maxDeadline) {
        void endSession("max");
        return;
      }
      if (now >= idleDeadline) {
        void endSession("idle");
        return;
      }

      const idleWarning = now >= idleDeadline - WARNING_MS;
      let next: { reason: "idle" | "max"; endsAt: number } | null = null;
      if (idleWarning) next = { reason: "idle", endsAt: idleDeadline };
      if (
        maxDeadline !== null &&
        !maxDismissedRef.current &&
        now >= maxDeadline - MAX_WARNING_MS &&
        (!next || maxDeadline < next.endsAt)
      ) {
        next = { reason: "max", endsAt: maxDeadline };
      }

      if (next) {
        const shown: Warning = {
          ...next,
          secondsLeft: Math.max(0, Math.ceil((next.endsAt - now) / 1000)),
        };
        warningRef.current = shown;
        setWarning(shown);
      } else if (warningRef.current) {
        warningRef.current = null;
        setWarning(null);
      }

      if (
        !idleWarning &&
        now - lastBeatRef.current >= HEARTBEAT_MS &&
        lastActivityRef.current > lastBeatRef.current
      ) {
        void beat();
      }
    };

    const onActivity = () => {
      if (warningRef.current?.reason === "idle") return;
      markActive();
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === ACTIVITY_KEY && event.newValue) {
        const at = Number(event.newValue);
        if (Number.isFinite(at) && at > lastActivityRef.current) {
          lastActivityRef.current = at;
        }
      } else if (event.key === END_KEY && event.newValue) {
        endingRef.current = true;
        let reason: SessionEndReason | null = null;
        try {
          const parsed = JSON.parse(event.newValue) as { reason?: unknown };
          reason = isSessionEndReason(parsed.reason) ? parsed.reason : null;
        } catch {
          reason = null;
        }
        window.location.replace(toLoginUrl(reason));
      }
    };

    ACTIVITY_EVENTS.forEach((name) =>
      window.addEventListener(name, onActivity, {
        passive: true,
        capture: true,
      }),
    );
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", tick);
    const id = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(id);
      ACTIVITY_EVENTS.forEach((name) =>
        window.removeEventListener(name, onActivity, { capture: true }),
      );
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [beat, endSession, idleMs, markActive]);

  const stay = () => {
    markActive(true);
    warningRef.current = null;
    setWarning(null);
    void beat();
  };

  const dismissMax = () => {
    maxDismissedRef.current = true;
    warningRef.current = null;
    setWarning(null);
  };

  if (!warning) return null;

  const isIdle = warning.reason === "idle";

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      aria-describedby="session-warning-text"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-7 shadow-[0_0_60px_rgba(220,38,38,0.25)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
            <Clock className="h-5 w-5" />
          </span>
          <div className="flex flex-col gap-2">
            <h2
              id="session-warning-title"
              className="text-lg font-semibold tracking-tight text-white"
            >
              {isIdle ? "Are you still there?" : "Session ending soon"}
            </h2>
            <p
              id="session-warning-text"
              className="text-sm leading-relaxed text-zinc-400"
            >
              {isIdle
                ? "For your security, you will be signed out due to inactivity in"
                : "Your session reaches its maximum length in"}{" "}
              <span className="font-semibold tabular-nums text-white">
                {formatCountdown(warning.secondsLeft)}
              </span>
              {isIdle
                ? "."
                : ". Save your work, you will need to sign in again."}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {isIdle ? (
            <button
              type="button"
              autoFocus
              onClick={stay}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-sm font-semibold text-white shadow-[0_0_24px_rgba(220,38,38,0.45)] transition hover:shadow-[0_0_34px_rgba(239,68,68,0.6)]"
            >
              Stay signed in
            </button>
          ) : (
            <button
              type="button"
              autoFocus
              onClick={dismissMax}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 text-sm font-semibold text-white shadow-[0_0_24px_rgba(220,38,38,0.45)] transition hover:shadow-[0_0_34px_rgba(239,68,68,0.6)]"
            >
              Continue working
            </button>
          )}
          <button
            type="button"
            onClick={() => void endSession(null)}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/[0.08]"
          >
            <LogOut className="h-4 w-4" />
            Sign out now
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionGuard;
