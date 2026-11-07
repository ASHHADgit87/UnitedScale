import { redirect } from "next/navigation";
import { PackagePlus } from "lucide-react";
import { MovementType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { loadStockOptions } from "@/lib/stock-data";
import { formatDate, formatPkr, formatUnits } from "@/lib/format";
import { EmptyState, PageHeader, Panel } from "@/components/layout/PageKit";
import PurchaseForm from "./PurchaseForm";

export const dynamic = "force-dynamic";

export default async function PurchasingPage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || !OFFICE_ROLES.includes(user.role))
    redirect("/");

  const [{ products, locations }, recent] = await Promise.all([
    loadStockOptions(),
    prisma.stockMovement.findMany({
      where: {
        type: { in: [MovementType.PURCHASE, MovementType.OPENING_STOCK] },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        reference: true,
        quantity: true,
        totalCost: true,
        createdAt: true,
        product: { select: { name: true, unit: true } },
        destWarehouse: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operations"
        title="Purchasing"
        description="Receive stock into a location. Each receipt becomes a batch with its own cost."
      />

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <PurchaseForm
            products={products.map((product) => ({
              id: product.id,
              sku: product.sku,
              name: product.name,
              unit: product.unit,
            }))}
            locations={locations}
            canBackdate={user.role === "ADMIN"}
          />
        </div>

        <div className="flex w-full flex-none flex-col gap-6 xl:w-[380px]">
          <Panel title="Recent receipts" subtitle="The latest stock received.">
            {recent.length === 0 ? (
              <EmptyState
                icon={PackagePlus}
                title="Nothing received yet"
                description="Receipts you record will appear here."
              />
            ) : (
              <div className="flex flex-col divide-y divide-white/10">
                {recent.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-white">
                        {entry.product.name}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatUnits(Number(entry.quantity))}{" "}
                        {entry.product.unit} ·{" "}
                        {entry.destWarehouse?.name ?? "—"} ·{" "}
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    <span className="flex-none text-sm font-semibold tabular-nums text-white">
                      {formatPkr(Number(entry.totalCost ?? 0))}
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
