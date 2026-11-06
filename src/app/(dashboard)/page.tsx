import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Award,
  Boxes,
  Building2,
  Layers,
  PackagePlus,
  ShoppingCart,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { LayerStatus } from "@prisma/client";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatPkr, formatUnits } from "@/lib/format";

export const dynamic = "force-dynamic";

const STOCK_STYLES = {
  ok: {
    label: "In stock",
    className: "border-white/15 bg-white/[0.05] text-zinc-200",
  },
  low: {
    label: "Low stock",
    className: "border-red-500/40 bg-red-500/10 text-red-300",
  },
  out: {
    label: "Out of stock",
    className: "border-red-500 bg-red-600 text-white",
  },
} as const;

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Karachi",
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface KpiProps {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  accent?: boolean;
}

function Kpi({ label, value, note, icon: Icon, accent = false }: KpiProps) {
  return (
    <div
      className={`relative flex min-w-[220px] flex-1 flex-col gap-3 overflow-hidden rounded-2xl border p-5 backdrop-blur-xl ${
        accent
          ? "border-red-500/40 bg-gradient-to-br from-red-600/20 via-red-600/5 to-transparent shadow-[0_0_40px_rgba(220,38,38,0.2)]"
          : "border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-400">
          {label}
        </span>
        <Icon className="h-4 w-4 text-red-400" />
      </div>
      <span className="text-2xl font-semibold tabular-nums text-white">
        {value}
      </span>
      <span className="text-xs text-zinc-500">{note}</span>
    </div>
  );
}

interface PanelProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

function Panel({ title, subtitle, children }: PanelProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
      <div className="flex flex-col gap-0.5 border-b border-white/10 px-5 py-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/pending");

  const canSeeCosts = user.role !== "TECHNICIAN";
  const isOffice = canSeeCosts;

  const [products, warehouses, certificateCount, pendingCount] =
    await Promise.all([
      prisma.product.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          sku: true,
          name: true,
          brand: true,
          sellingPrice: true,
          minStockLevel: true,
          inventoryLayers: {
            where: { status: LayerStatus.ACTIVE, remainingQty: { gt: 0 } },
            orderBy: { fifoDate: "asc" },
            select: {
              warehouseId: true,
              batchNumber: true,
              originalQty: true,
              remainingQty: true,
              unitCost: true,
              fifoDate: true,
            },
          },
        },
      }),
      prisma.warehouse.findMany({
        orderBy: { isHeadquarters: "desc" },
        select: { id: true, name: true, location: true, isHeadquarters: true },
      }),
      prisma.calibrationCertificate.count(),
      user.role === "ADMIN"
        ? prisma.user.count({
            where: { status: "PENDING", supabaseId: { not: null } },
          })
        : Promise.resolve(0),
    ]);

  const byWarehouse = new Map<string, { units: number; value: number }>();

  const rows = products.map((product) => {
    let available = 0;
    let value = 0;

    product.inventoryLayers.forEach((layer) => {
      const remaining = Number(layer.remainingQty);
      const cost = remaining * Number(layer.unitCost);
      available += remaining;
      value += cost;

      const current = byWarehouse.get(layer.warehouseId) ?? {
        units: 0,
        value: 0,
      };
      current.units += remaining;
      current.value += cost;
      byWarehouse.set(layer.warehouseId, current);
    });

    const first = product.inventoryLayers[0];
    const minimum = Number(product.minStockLevel);
    const status = available <= 0 ? "out" : available <= minimum ? "low" : "ok";

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand ?? "—",
      price: Number(product.sellingPrice),
      available,
      value,
      status,
      next: first
        ? {
            batch: first.batchNumber,
            fifoDate: first.fifoDate,
            unitCost: Number(first.unitCost),
            remaining: Number(first.remainingQty),
            original: Number(first.originalQty),
          }
        : null,
    };
  });

  const totalUnits = rows.reduce((sum, row) => sum + row.available, 0);
  const totalValue = rows.reduce((sum, row) => sum + row.value, 0);
  const lowCount = rows.filter((row) => row.status !== "ok").length;
  const activeBatches = products.reduce(
    (sum, product) => sum + product.inventoryLayers.length,
    0,
  );

  const nextBatches = rows
    .flatMap((row) =>
      row.next ? [{ id: row.id, name: row.name, ...row.next }] : [],
    )
    .sort((a, b) => a.fifoDate.getTime() - b.fifoDate.getTime())
    .slice(0, 5);

  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      {pendingCount > 0 && (
        <Link
          href="/admin/users"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 transition-colors hover:bg-red-500/15"
        >
          <span>
            {pendingCount} {pendingCount === 1 ? "person is" : "people are"}{" "}
            waiting for access approval.
          </span>
          <ArrowRight className="h-4 w-4 flex-none" />
        </Link>
      )}

      <section className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative flex flex-col gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-red-400">
            United Scale · Karachi
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {greeting()}, {firstName}
          </h1>
          <p className="max-w-xl text-sm text-zinc-400">
            Here is where your stock stands across your warehouses right now.
          </p>
        </div>

        {isOffice && (
          <div className="relative flex flex-wrap gap-3">
            <Link
              href="/sales"
              className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-red-500 px-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(220,38,38,0.45)] transition hover:shadow-[0_0_34px_rgba(239,68,68,0.6)]"
            >
              <ShoppingCart className="h-4 w-4" />
              Record a sale
            </Link>
            <Link
              href="/purchasing"
              className="flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/[0.08]"
            >
              <PackagePlus className="h-4 w-4" />
              Receive stock
            </Link>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-4">
        {canSeeCosts && (
          <Kpi
            label="Stock value"
            value={formatPkr(totalValue)}
            note={`${activeBatches} active batches`}
            icon={Layers}
            accent
          />
        )}
        <Kpi
          label="Units in stock"
          value={formatUnits(totalUnits)}
          note={`${rows.length} products`}
          icon={Boxes}
          accent={!canSeeCosts}
        />
        <Kpi
          label="Low stock"
          value={String(lowCount)}
          note={
            lowCount === 0 ? "Everything is stocked" : "Products to reorder"
          }
          icon={TriangleAlert}
        />
        <Kpi
          label="Locations"
          value={String(warehouses.length)}
          note={
            warehouses.map((warehouse) => warehouse.name).join(" · ") ||
            "No locations yet"
          }
          icon={Building2}
        />
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {canSeeCosts && (
            <Panel
              title="Next stock to be sold"
              subtitle="The oldest batch of each product is used first."
            >
              {nextBatches.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-zinc-500">
                  No active stock batches yet.
                </p>
              ) : (
                <div className="flex flex-col divide-y divide-white/10">
                  {nextBatches.map((batch) => {
                    const percent =
                      batch.original > 0
                        ? Math.min(
                            (batch.remaining / batch.original) * 100,
                            100,
                          )
                        : 0;

                    return (
                      <div
                        key={batch.id}
                        className="flex flex-col gap-2.5 px-5 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-medium text-white">
                              {batch.name}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {batch.batch ?? "Batch"} · received{" "}
                              {formatDate(batch.fifoDate)}
                            </span>
                          </div>
                          <div className="flex flex-none flex-col items-end">
                            <span className="text-sm font-semibold tabular-nums text-white">
                              {formatPkr(batch.unitCost)}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {formatUnits(batch.remaining)} of{" "}
                              {formatUnits(batch.original)} left
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          <Panel
            title="Product availability"
            subtitle="Live quantities across all locations."
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-3 py-3 font-medium">Brand</th>
                    <th className="px-3 py-3 font-medium">Available</th>
                    {canSeeCosts && (
                      <th className="px-3 py-3 font-medium">Unit cost</th>
                    )}
                    <th className="px-3 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-8 text-center text-zinc-500"
                      >
                        No products yet.
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => {
                    const style =
                      STOCK_STYLES[row.status as keyof typeof STOCK_STYLES];
                    return (
                      <tr
                        key={row.id}
                        className="transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-medium text-white">
                              {row.name}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {row.sku}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-zinc-400">
                          {row.brand}
                        </td>
                        <td className="px-3 py-3.5 font-semibold tabular-nums text-white">
                          {formatUnits(row.available)}
                        </td>
                        {canSeeCosts && (
                          <td className="px-3 py-3.5 tabular-nums text-zinc-300">
                            {row.next ? formatPkr(row.next.unitCost) : "—"}
                          </td>
                        )}
                        <td className="px-3 py-3.5 tabular-nums text-red-300">
                          {formatPkr(row.price)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${style.className}`}
                          >
                            {style.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="flex w-full flex-none flex-col gap-6 xl:w-[380px]">
          <Panel title="Locations" subtitle="Where your stock is held.">
            <div className="flex flex-col gap-3 p-5">
              {warehouses.length === 0 && (
                <p className="text-sm text-zinc-500">No locations yet.</p>
              )}
              {warehouses.map((warehouse) => {
                const stats = byWarehouse.get(warehouse.id) ?? {
                  units: 0,
                  value: 0,
                };
                return (
                  <div
                    key={warehouse.id}
                    className={`flex flex-col gap-2 rounded-xl border p-4 ${
                      warehouse.isHeadquarters
                        ? "border-red-500/30 bg-red-500/[0.06]"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white">
                        {warehouse.name}
                      </span>
                      {warehouse.isHeadquarters && (
                        <span className="rounded-full border border-red-500/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-red-300">
                          Head office
                        </span>
                      )}
                    </div>
                    <span className="text-xs leading-relaxed text-zinc-500">
                      {warehouse.location}
                    </span>
                    <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs">
                      <span className="text-zinc-400">
                        {formatUnits(stats.units)} units
                      </span>
                      {canSeeCosts && (
                        <span className="font-semibold tabular-nums text-white">
                          {formatPkr(stats.value)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {isOffice && (
                <Link
                  href="/transfers"
                  className="mt-1 flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] text-sm font-medium text-zinc-200 transition hover:border-white/30 hover:bg-white/[0.08]"
                >
                  Transfer stock
                  <ArrowRight className="h-4 w-4 text-red-400" />
                </Link>
              )}
            </div>
          </Panel>

          <Panel
            title="Calibration"
            subtitle="Certificates for client instruments."
          >
            <div className="flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10">
                <Award className="h-5 w-5 text-red-400" />
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold tabular-nums text-white">
                  {certificateCount}
                </span>
                <span className="text-xs text-zinc-500">
                  {certificateCount === 1 ? "certificate" : "certificates"} on
                  record. Issuing opens soon.
                </span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
