import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes, Layers, PackagePlus, ShoppingCart } from "lucide-react";
import { LayerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { formatDate, formatPkr, formatUnits } from "@/lib/format";
import { buildHref, first, type SearchParams } from "@/lib/query";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  EmptyState,
  FilterLink,
  PageHeader,
  Panel,
  StatCard,
} from "@/components/layout/PageKit";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function StockBatchesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || !OFFICE_ROLES.includes(user.role))
    redirect("/");

  const params = await searchParams;
  const statusParam = first(params.status);
  const status =
    statusParam === "depleted"
      ? "depleted"
      : statusParam === "all"
        ? "all"
        : "active";
  const warehouseParam = first(params.warehouse);
  const baseWhere = warehouseParam ? { warehouseId: warehouseParam } : {};

  const [locations, activeForTotals, layers] = await Promise.all([
    prisma.warehouse.findMany({
      orderBy: [{ isHeadquarters: "desc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.inventoryLayer.findMany({
      where: {
        ...baseWhere,
        status: LayerStatus.ACTIVE,
        remainingQty: { gt: 0 },
      },
      select: { remainingQty: true, unitCost: true },
    }),
    prisma.inventoryLayer.findMany({
      where: {
        ...baseWhere,
        ...(status === "active"
          ? { status: LayerStatus.ACTIVE, remainingQty: { gt: 0 } }
          : status === "depleted"
            ? { status: LayerStatus.DEPLETED }
            : {}),
      },
      orderBy: { fifoDate: "asc" },
      take: 300,
      include: {
        product: { select: { name: true, sku: true, unit: true } },
        warehouse: { select: { name: true } },
      },
    }),
  ]);

  const totalValue = activeForTotals.reduce(
    (sum, layer) => sum + Number(layer.remainingQty) * Number(layer.unitCost),
    0,
  );
  const totalUnits = activeForTotals.reduce(
    (sum, layer) => sum + Number(layer.remainingQty),
    0,
  );

  const nextIds = new Set<string>();
  const seen = new Set<string>();
  layers.forEach((layer) => {
    if (layer.status !== LayerStatus.ACTIVE || Number(layer.remainingQty) <= 0)
      return;
    const key = `${layer.productId}:${layer.warehouseId}`;
    if (!seen.has(key)) {
      seen.add(key);
      nextIds.add(layer.id);
    }
  });

  const hrefFor = (overrides: Record<string, string | undefined>) =>
    buildHref("/inventory/layers", {
      status: statusParam,
      warehouse: warehouseParam,
      ...overrides,
    });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Inventory"
        title="Stock batches"
        description="Every purchase creates a batch with its own cost. Sales always use the oldest batch first."
        actions={
          <>
            <Link href="/sales" className={buttonVariants({ size: "sm" })}>
              <ShoppingCart className="h-4 w-4" />
              Record a sale
            </Link>
            <Link
              href="/purchasing"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <PackagePlus className="h-4 w-4" />
              Receive stock
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-4">
        <StatCard
          label="Stock value"
          value={formatPkr(totalValue)}
          note="Remaining units at their batch cost"
          icon={Layers}
          accent
        />
        <StatCard
          label="Units in stock"
          value={formatUnits(totalUnits)}
          note={`${activeForTotals.length} active batches`}
          icon={Boxes}
        />
      </div>

      <Panel title="Batch ledger" subtitle={`${layers.length} batches shown`}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-white/10 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Location
            </span>
            <FilterLink
              href={hrefFor({ warehouse: undefined })}
              active={!warehouseParam}
            >
              All
            </FilterLink>
            {locations.map((location) => (
              <FilterLink
                key={location.id}
                href={hrefFor({ warehouse: location.id })}
                active={warehouseParam === location.id}
              >
                {location.name}
              </FilterLink>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Status
            </span>
            <FilterLink
              href={hrefFor({ status: undefined })}
              active={status === "active"}
            >
              In stock
            </FilterLink>
            <FilterLink
              href={hrefFor({ status: "depleted" })}
              active={status === "depleted"}
            >
              Used up
            </FilterLink>
            <FilterLink
              href={hrefFor({ status: "all" })}
              active={status === "all"}
            >
              All
            </FilterLink>
          </div>
        </div>

        {layers.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No batches found"
            description="Receive stock from the Purchasing page to create your first batch."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  <th className="px-5 py-3 font-medium">Batch</th>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-3 py-3 font-medium">Remaining</th>
                  <th className="px-3 py-3 font-medium">Unit cost</th>
                  <th className="px-3 py-3 font-medium">Value</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {layers.map((layer) => {
                  const original = Number(layer.originalQty);
                  const remaining = Number(layer.remainingQty);
                  const percent =
                    original > 0
                      ? Math.min((remaining / original) * 100, 100)
                      : 0;
                  const isNext = nextIds.has(layer.id);
                  const depleted = layer.status === LayerStatus.DEPLETED;

                  return (
                    <tr
                      key={layer.id}
                      className={`transition-colors hover:bg-white/[0.03] ${depleted ? "opacity-60" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">
                            {layer.batchNumber ?? "Batch"}
                          </span>
                          <span className="text-xs text-zinc-500">
                            Received {formatDate(layer.fifoDate)}
                            {layer.sourceReference
                              ? ` · ${layer.sourceReference}`
                              : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-white">
                            {layer.product.name}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {layer.product.sku}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-zinc-400">
                        {layer.warehouse.name}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex min-w-[120px] flex-col gap-1.5">
                          <span className="tabular-nums text-white">
                            {formatUnits(remaining)} of {formatUnits(original)}{" "}
                            {layer.product.unit}
                          </span>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-400"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-zinc-300">
                        {formatPkr(Number(layer.unitCost))}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums font-semibold text-white">
                        {formatPkr(remaining * Number(layer.unitCost))}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {depleted ? (
                          <Badge variant="secondary">Used up</Badge>
                        ) : isNext ? (
                          <Badge variant="default">Sells next</Badge>
                        ) : (
                          <Badge variant="outline">In stock</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
