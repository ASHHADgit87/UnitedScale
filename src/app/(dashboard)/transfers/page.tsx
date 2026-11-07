import { redirect } from "next/navigation";
import { ArrowRight, Truck } from "lucide-react";
import { MovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { loadStockOptions } from "@/lib/stock-data";
import { formatDate, formatPkr, formatUnits } from "@/lib/format";
import { EmptyState, PageHeader, Panel } from "@/components/layout/PageKit";
import TransferForm from "./TransferForm";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || !OFFICE_ROLES.includes(user.role))
    redirect("/");

  const [{ products, locations }, recent] = await Promise.all([
    loadStockOptions(),
    prisma.stockMovement.findMany({
      where: { type: MovementType.TRANSFER_OUT },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        quantity: true,
        totalCost: true,
        createdAt: true,
        product: { select: { name: true, unit: true } },
        sourceWarehouse: { select: { name: true } },
        destWarehouse: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operations"
        title="Transfers"
        description="Move stock between locations. Each batch keeps its original date and cost."
      />

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <TransferForm products={products} locations={locations} />
        </div>

        <div className="flex w-full flex-none flex-col gap-6 xl:w-[380px]">
          <Panel
            title="Recent transfers"
            subtitle="The latest movements between locations."
          >
            {recent.length === 0 ? (
              <EmptyState
                icon={Truck}
                title="No transfers yet"
                description="Transfers you record will appear here."
              />
            ) : (
              <div className="flex flex-col divide-y divide-white/10">
                {recent.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-1 px-5 py-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium text-white">
                        {entry.product.name}
                      </span>
                      <span className="flex-none text-sm font-semibold tabular-nums text-white">
                        {formatPkr(Number(entry.totalCost ?? 0))}
                      </span>
                    </div>
                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                      {formatUnits(Number(entry.quantity))} {entry.product.unit}{" "}
                      · {entry.sourceWarehouse?.name ?? "—"}
                      <ArrowRight className="h-3 w-3 text-red-400" />
                      {entry.destWarehouse?.name ?? "—"} ·{" "}
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
