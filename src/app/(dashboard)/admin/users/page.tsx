import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getInitials, formatDate } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/permissions";
import UserActions from "./UserActions";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  PENDING: {
    label: "Pending",
    className: "border-red-500/50 bg-red-500/10 text-red-300",
  },
  ACTIVE: {
    label: "Active",
    className: "border-white/20 bg-white/[0.06] text-white",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "border-zinc-700 bg-zinc-900 text-zinc-500",
  },
} as const;

export default async function TeamAccessPage() {
  const me = await getCurrentUser();
  if (!me || me.status !== "ACTIVE" || me.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    where: { supabaseId: { not: null } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  const count = (status: keyof typeof STATUS_STYLES) =>
    users.filter((user) => user.status === status).length;

  return (
    <div className="flex flex-col gap-6">
      <section className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent p-6 backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative flex flex-col gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-red-400">
            Administration
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Team access
          </h1>
          <p className="max-w-xl text-sm text-zinc-400">
            Approve new staff and decide what each person can do. Only
            administrators see this page.
          </p>
        </div>
        <div className="relative flex flex-wrap gap-3">
          {(
            Object.keys(STATUS_STYLES) as Array<keyof typeof STATUS_STYLES>
          ).map((status) => (
            <span
              key={status}
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${STATUS_STYLES[status].className}`}
            >
              {STATUS_STYLES[status].label} · {count(status)}
            </span>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl">
        {users.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-zinc-500">
            No accounts yet.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-white/10">
            {users.map((user) => {
              const style = STATUS_STYLES[user.status];
              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-900 text-xs font-semibold text-white">
                      {getInitials(user.name)}
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-white">
                          {user.name}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest ${style.className}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <span className="truncate text-xs text-zinc-500">
                        {user.email}
                        {user.phone ? ` · ${user.phone}` : ""}
                      </span>
                      <span className="text-[11px] text-zinc-600">
                        Requested {formatDate(user.createdAt)} ·{" "}
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </div>

                  <UserActions
                    userId={user.id}
                    role={user.role}
                    status={user.status}
                    isSelf={user.id === me.id}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
