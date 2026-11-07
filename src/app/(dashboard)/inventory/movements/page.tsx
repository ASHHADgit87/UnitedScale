import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftRight, ArrowRight, Search, ShoppingCart } from "lucide-react";
import { MovementType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { formatPkr, formatUnits } from "@/lib/format";
import { buildHref, first, type SearchParams } from "@/lib/query";
import { buttonVariants } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  EmptyState,
  FilterLink,
  PageHeader,
  Pagination,
  Panel,
} from "@/components/layout/PageKit";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const GROUP_KEYS = ["purchase", "sale", "transfer", "other"] as const;

const TYPE_GROUPS: Record<(typeof GROUP_KEYS)[number], MovementType[]> = {
  purchase: [MovementType.PURCHASE, MovementType.OPENING_STOCK],
  sale: [MovementType.SALE_DEDUCTION],
  transfer: [MovementType.TRANSFER_OUT, MovementType.TRANSFER_IN],
  other: [MovementType.CALIBRATION_USAGE, MovementType.SCRAP_ADJUSTMENT],
};

const GROUP_LABELS: Record<(typeof GROUP_KEYS)[number], string> = {
  purchase: "Purchases",
  sale: "Sales",
  transfer: "Transfers",
  other: "Adjustments",
};

const TYPE_META: Record<
  MovementType,
  { label: string; incoming: boolean; variant: BadgeProps["variant"] }
> = {
  PURCHASE: { label: "Purchase", incoming: true, variant: "success" },
  OPENING_STOCK: { label: "Opening stock", incoming: true, variant: "success" },
  SALE_DEDUCTION: { label: "Sale", incoming: false, variant: "cyber" },
  TRANSFER_OUT: { label: "Transfer out", incoming: false, variant: "warning" },
  TRANSFER_IN: { label: "Transfer in", incoming: true, variant: "outline" },
  CALIBRATION_USAGE: {
    label: "Calibration use",
    incoming: false,
    variant: "secondary",
  },
  SCRAP_ADJUSTMENT: {
    label: "Adjustment",
    incoming: false,
    variant: "secondary",
  },
};

const formatDateTime = (date: Date) =>
  date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Karachi",
  });

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function StockMovementsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || !OFFICE_ROLES.includes(user.role))
    redirect("/");

  const params = await searchParams;
  const groupKey = GROUP_KEYS.find((key) => key === first(params.type));
  const query = first(params.q)?.trim().slice(0, 80);

  const where: Prisma.StockMovementWhereInput = {
    ...(groupKey ? { type: { in: TYPE_GROUPS[groupKey] } } : {}),
    ...(query
      ? {
          OR: [
            { reference: { contains: query, mode: "insensitive" } },
            { reason: { contains: query, mode: "insensitive" } },
            { notes: { contains: query, mode: "insensitive" } },
            { product: { name: { contains: query, mode: "insensitive" } } },
            { product: { sku: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const total = await prisma.stockMovement.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(
    Math.max(1, Number(first(params.page)) || 1),
    pageCount,
  );

  const movements = await prisma.stockMovement.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      product: { select: { name: true, sku: true, unit: true } },
      sourceWarehouse: { select: { name: true } },
      destWarehouse: { select: { name: true } },
      performedBy: { select: { name: true } },
    },
  });

  const hrefFor = (overrides: Record<string, string | undefined>) =>
    buildHref("/inventory/movements", {
      type: groupKey,
      q: query,
      ...overrides,
    });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Inventory"
        title="Stock movements"
        description="A permanent record of every purchase, sale and transfer, with the exact cost used."
        actions={
          <Link href="/sales" className={buttonVariants({ size: "sm" })}>
            <ShoppingCart className="h-4 w-4" />
            Record a sale
          </Link>
        }
      />

      <Panel
        title="Movement log"
        subtitle={`${total} ${total === 1 ? "entry" : "entries"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterLink
              href={hrefFor({ type: undefined, page: undefined })}
              active={!groupKey}
            >
              All
            </FilterLink>
            {GROUP_KEYS.map((key) => (
              <FilterLink
                key={key}
                href={hrefFor({ type: key, page: undefined })}
                active={groupKey === key}
              >
                {GROUP_LABELS[key]}
              </FilterLink>
            ))}
          </div>

          <form
            method="get"
            action="/inventory/movements"
            className="flex items-center gap-2"
          >
            {groupKey && <input type="hidden" name="type" value={groupKey} />}
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-zinc-500" />
              <input
                name="q"
                defaultValue={query ?? ""}
                placeholder="Search reference, product or note"
                className="h-9 w-64 rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/70"
              />
            </div>
            <button
              type="submit"
              className="h-9 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 text-xs font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/[0.08]"
            >
              Search
            </button>
          </form>
        </div>

        {movements.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No movements found"
            description="Try a different filter or search term."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Quantity</th>
                  <th className="px-3 py-3 font-medium">Unit cost</th>
                  <th className="px-3 py-3 font-medium">Total</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Recorded by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {movements.map((movement) => {
                  const meta = TYPE_META[movement.type];
                  return (
                    <tr
                      key={movement.id}
                      className="align-top transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">
                            {movement.reference}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {formatDateTime(movement.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-white">
                            {movement.product.name}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {movement.product.sku}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 font-semibold tabular-nums text-white">
                        {meta.incoming ? "+" : "−"}
                        {formatUnits(Number(movement.quantity))}{" "}
                        {movement.product.unit}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-zinc-300">
                        {movement.unitCost
                          ? formatPkr(Number(movement.unitCost))
                          : "—"}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-red-300">
                        {movement.totalCost
                          ? formatPkr(Number(movement.totalCost))
                          : "—"}
                      </td>
                      <td className="px-3 py-3.5 text-zinc-400">
                        {movement.sourceWarehouse && movement.destWarehouse ? (
                          <span className="flex flex-wrap items-center gap-1.5">
                            {movement.sourceWarehouse.name}
                            <ArrowRight className="h-3 w-3 text-red-400" />
                            {movement.destWarehouse.name}
                          </span>
                        ) : (
                          ((movement.sourceWarehouse ?? movement.destWarehouse)
                            ?.name ?? "—")
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex max-w-[260px] flex-col">
                          <span className="text-zinc-200">
                            {movement.performedBy?.name ?? "—"}
                          </span>
                          {movement.reason && (
                            <span className="text-xs text-zinc-500">
                              {movement.reason}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          pageCount={pageCount}
          hrefFor={(target) =>
            hrefFor({ page: target === 1 ? undefined : String(target) })
          }
        />
      </Panel>
    </div>
  );
}
