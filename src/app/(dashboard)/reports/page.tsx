import { redirect } from "next/navigation";
import {
  BarChart3,
  Boxes,
  Download,
  Layers,
  PackagePlus,
  ShoppingCart,
  TriangleAlert,
} from "lucide-react";
import { CertStatus, LayerStatus, MovementType } from "@prisma/client";
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
import { dueInfo } from "@/lib/calibration";

export const dynamic = "force-dynamic";

const PERIODS = [
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "90", label: "Last 90 days", days: 90 },
  { value: "365", label: "Last 12 months", days: 365 },
  { value: "all", label: "All time", days: 0 },
] as const;

interface PageProps {
  searchParams: Promise<SearchParams>;
}

function Bars({ rows }: { rows: { label: string; value: number }[] }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return (
    <div className="flex flex-col gap-4 p-5">
      {rows.map((row) => {
        const percent = total > 0 ? (row.value / total) * 100 : 0;
        return (
          <div key={row.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-zinc-300">{row.label}</span>
              <span className="flex-none font-semibold tabular-nums text-white">
                {formatPkr(row.value)}{" "}
                <span className="text-xs font-normal text-zinc-500">
                  {percent.toFixed(1)}%
                </span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-400"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm">
        <span className="text-zinc-400">Total</span>
        <span className="font-semibold tabular-nums text-white">
          {formatPkr(total)}
        </span>
      </div>
    </div>
  );
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || !OFFICE_ROLES.includes(user.role))
    redirect("/");

  const params = await searchParams;
  const period =
    PERIODS.find((item) => item.value === first(params.period)) ?? PERIODS[0];
  const since =
    period.days > 0 ? new Date(Date.now() - period.days * 86_400_000) : null;
  const dateFilter = since ? { createdAt: { gte: since } } : {};

  const [activeLayers, sales, purchases, certificates, lowStock] =
    await Promise.all([
      prisma.inventoryLayer.findMany({
        where: { status: LayerStatus.ACTIVE, remainingQty: { gt: 0 } },
        select: {
          remainingQty: true,
          unitCost: true,
          warehouse: { select: { name: true } },
          product: { select: { category: { select: { name: true } } } },
        },
      }),
      prisma.stockMovement.findMany({
        where: { type: MovementType.SALE_DEDUCTION, ...dateFilter },
        select: {
          quantity: true,
          totalCost: true,
          product: { select: { id: true, name: true, sku: true } },
        },
      }),
      prisma.stockMovement.findMany({
        where: { type: MovementType.PURCHASE, ...dateFilter },
        select: { totalCost: true },
      }),
      prisma.calibrationCertificate.findMany({
        where: { status: CertStatus.APPROVED_GOVT_SINDH },
        orderBy: { nextDueDate: "asc" },
        take: 8,
        select: {
          id: true,
          certificateNumber: true,
          clientName: true,
          equipmentModel: true,
          nextDueDate: true,
        },
      }),
      prisma.product.findMany({
        select: {
          minStockLevel: true,
          inventoryLayers: {
            where: { status: LayerStatus.ACTIVE, remainingQty: { gt: 0 } },
            select: { remainingQty: true },
          },
        },
      }),
    ]);

  const byCategory = new Map<string, number>();
  const byLocation = new Map<string, number>();
  let stockValue = 0;
  let stockUnits = 0;

  activeLayers.forEach((layer) => {
    const remaining = Number(layer.remainingQty);
    const value = remaining * Number(layer.unitCost);
    stockValue += value;
    stockUnits += remaining;
    const category = layer.product.category.name;
    byCategory.set(category, (byCategory.get(category) ?? 0) + value);
    byLocation.set(
      layer.warehouse.name,
      (byLocation.get(layer.warehouse.name) ?? 0) + value,
    );
  });

  const toRows = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

  const soldCost = sales.reduce(
    (sum, sale) => sum + Number(sale.totalCost ?? 0),
    0,
  );
  const soldUnits = sales.reduce((sum, sale) => sum + Number(sale.quantity), 0);
  const purchased = purchases.reduce(
    (sum, entry) => sum + Number(entry.totalCost ?? 0),
    0,
  );

  const topMap = new Map<
    string,
    { name: string; sku: string; units: number; cost: number }
  >();
  sales.forEach((sale) => {
    const current = topMap.get(sale.product.id) ?? {
      name: sale.product.name,
      sku: sale.product.sku,
      units: 0,
      cost: 0,
    };
    current.units += Number(sale.quantity);
    current.cost += Number(sale.totalCost ?? 0);
    topMap.set(sale.product.id, current);
  });
  const topProducts = [...topMap.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const lowCount = lowStock.filter((product) => {
    const units = product.inventoryLayers.reduce(
      (sum, layer) => sum + Number(layer.remainingQty),
      0,
    );
    return units <= Number(product.minStockLevel);
  }).length;

  const toneClass = {
    ok: "text-zinc-400",
    soon: "text-red-300",
    late: "text-red-400",
  } as const;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        description="Stock value, sales cost and calibration due dates, straight from your records."
        actions={
          <>
            <a
              href="/api/reports/export?type=stock"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Download className="h-4 w-4" />
              Export stock
            </a>
            <a
              href={`/api/reports/export?type=movements&period=${period.value}`}
              className={buttonVariants({ size: "sm" })}
            >
              <Download className="h-4 w-4" />
              Export movements
            </a>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Period
        </span>
        {PERIODS.map((item) => (
          <FilterLink
            key={item.value}
            href={buildHref("/reports", {
              period: item.value === "30" ? undefined : item.value,
            })}
            active={period.value === item.value}
          >
            {item.label}
          </FilterLink>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <StatCard
          label="Stock value"
          value={formatPkr(stockValue)}
          note={`${formatUnits(stockUnits)} units on hand`}
          icon={Layers}
          accent
        />
        <StatCard
          label="Cost of goods sold"
          value={formatPkr(soldCost)}
          note={`${formatUnits(soldUnits)} units sold`}
          icon={ShoppingCart}
        />
        <StatCard
          label="Stock received"
          value={formatPkr(purchased)}
          note={`${purchases.length} purchase ${purchases.length === 1 ? "entry" : "entries"}`}
          icon={PackagePlus}
        />
        <StatCard
          label="Low stock"
          value={String(lowCount)}
          note={
            lowCount === 0 ? "Everything is stocked" : "Products to reorder"
          }
          icon={TriangleAlert}
        />
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Panel
            title="Stock value by category"
            subtitle="Remaining units at their batch cost."
          >
            {byCategory.size === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No stock yet"
                description="Receive stock to see its value here."
              />
            ) : (
              <Bars rows={toRows(byCategory)} />
            )}
          </Panel>

          <Panel title="Stock value by location">
            {byLocation.size === 0 ? (
              <EmptyState
                icon={Boxes}
                title="No stock yet"
                description="Receive stock to see its value here."
              />
            ) : (
              <Bars rows={toRows(byLocation)} />
            )}
          </Panel>
        </div>

        <div className="flex w-full flex-none flex-col gap-6 xl:w-[420px]">
          <Panel title="Top sellers" subtitle={period.label}>
            {topProducts.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No sales in this period"
                description="Recorded sales will appear here."
              />
            ) : (
              <div className="flex flex-col divide-y divide-white/10">
                {topProducts.map((product, index) => (
                  <div
                    key={product.sku}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg border border-white/10 text-xs text-zinc-400">
                        {index + 1}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-white">
                          {product.name}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {product.sku}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-none flex-col items-end">
                      <span className="text-sm font-semibold tabular-nums text-white">
                        {formatUnits(product.units)} units
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatPkr(product.cost)} cost
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Calibration due dates"
            subtitle="Approved certificates, soonest first."
          >
            {certificates.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No approved certificates"
                description="Approved certificates and their due dates will appear here."
              />
            ) : (
              <div className="flex flex-col divide-y divide-white/10">
                {certificates.map((certificate) => {
                  const due = dueInfo(certificate.nextDueDate);
                  return (
                    <a
                      key={certificate.id}
                      href={`/calibration/${certificate.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-white">
                          {certificate.clientName}
                        </span>
                        <span className="truncate text-xs text-zinc-500">
                          {certificate.certificateNumber} ·{" "}
                          {certificate.equipmentModel}
                        </span>
                      </div>
                      <div className="flex flex-none flex-col items-end gap-1">
                        <span className="text-xs text-zinc-400">
                          {formatDate(certificate.nextDueDate)}
                        </span>
                        <span
                          className={`text-xs font-semibold ${toneClass[due.tone]}`}
                        >
                          {due.text}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
