"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  APP_ROLES,
  ROLE_LABELS,
  type AppRole,
  type AppStatus,
} from "@/lib/permissions";

interface UserActionsProps {
  userId: string;
  role: AppRole;
  status: AppStatus;
  isSelf: boolean;
}

const primaryButton =
  "h-9 rounded-lg bg-gradient-to-r from-red-700 to-red-500 px-3.5 text-xs font-semibold text-snow shadow-[0_0_16px_rgba(220,38,38,0.4)] transition hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] disabled:opacity-50";
const quietButton =
  "h-9 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 text-xs font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/[0.08] disabled:opacity-50";

export default function UserActions({
  userId,
  role,
  status,
  isSelf,
}: UserActionsProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AppRole>(role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSelf) return <span className="text-xs text-zinc-500">This is you</span>;

  const submit = async (nextStatus: AppStatus) => {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: selectedRole,
          status: nextStatus,
        }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok) {
        setError(json?.message ?? "Update failed.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <select
          value={selectedRole}
          onChange={(event) => setSelectedRole(event.target.value as AppRole)}
          disabled={busy}
          aria-label="Role"
          className="h-9 rounded-lg border border-white/15 bg-zinc-900 px-3 text-xs text-white outline-none transition focus:border-red-500/70"
        >
          {APP_ROLES.map((item) => (
            <option key={item} value={item}>
              {ROLE_LABELS[item]}
            </option>
          ))}
        </select>

        {status === "PENDING" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => submit("ACTIVE")}
              className={primaryButton}
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => submit("SUSPENDED")}
              className={quietButton}
            >
              Reject
            </button>
          </>
        )}

        {status === "ACTIVE" && (
          <>
            <button
              type="button"
              disabled={busy || selectedRole === role}
              onClick={() => submit("ACTIVE")}
              className={primaryButton}
            >
              Save role
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => submit("SUSPENDED")}
              className={quietButton}
            >
              Suspend
            </button>
          </>
        )}

        {status === "SUSPENDED" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => submit("ACTIVE")}
            className={primaryButton}
          >
            Reactivate
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
