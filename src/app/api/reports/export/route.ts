import { NextRequest, NextResponse } from "next/server";
import { LayerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { fail, handleApiError } from "@/lib/api-utils";

type Cell = string | number | null | undefined;

const csvCell = (value: Cell): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);

  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
};

const toCsv = (headers: string[], rows: Cell[][]) =>
  `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export async function GET(req: NextRequest) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const periodDays = Number(searchParams.get("period"));
  const since =
    Number.isFinite(periodDays) && periodDays > 0
      ? new Date(Date.now() - periodDays * 86_400_000)
      : null;

  try {
    let csv: string;
    let name: string;

    if (type === "stock") {
      const layers = await prisma.inventoryLayer.findMany({
        where: { status: LayerStatus.ACTIVE, remainingQty: { gt: 0 } },
        orderBy: [{ productId: "asc" }, { fifoDate: "asc" }],
        include: {
          product: { select: { name: true, sku: true } },
          warehouse: { select: { name: true } },
        },
      });
      csv = toCsv(
        [
          "Batch",
          "Product",
          "SKU",
          "Location",
          "Received",
          "Original qty",
          "Remaining qty",
          "Unit cost (PKR)",
          "Value (PKR)",
        ],
        layers.map((layer) => [
          layer.batchNumber,
          layer.product.name,
          layer.product.sku,
          layer.warehouse.name,
          isoDate(layer.fifoDate),
          Number(layer.originalQty),
          Number(layer.remainingQty),
          Number(layer.unitCost),
          Number(layer.remainingQty) * Number(layer.unitCost),
        ]),
      );
      name = "stock-valuation";
    } else if (type === "movements") {
      const movements = await prisma.stockMovement.findMany({
        where: since ? { createdAt: { gte: since } } : undefined,
        orderBy: { createdAt: "desc" },
        take: 5000,
        include: {
          product: { select: { name: true, sku: true } },
          sourceWarehouse: { select: { name: true } },
          destWarehouse: { select: { name: true } },
          performedBy: { select: { name: true } },
        },
      });
      csv = toCsv(
        [
          "Reference",
          "Date",
          "Type",
          "Product",
          "SKU",
          "Quantity",
          "Unit cost (PKR)",
          "Total (PKR)",
          "From",
          "To",
          "Recorded by",
          "Reason",
        ],
        movements.map((movement) => [
          movement.reference,
          movement.createdAt.toISOString(),
          movement.type,
          movement.product.name,
          movement.product.sku,
          Number(movement.quantity),
          movement.unitCost ? Number(movement.unitCost) : null,
          movement.totalCost ? Number(movement.totalCost) : null,
          movement.sourceWarehouse?.name,
          movement.destWarehouse?.name,
          movement.performedBy?.name,
          movement.reason,
        ]),
      );
      name = "stock-movements";
    } else {
      return fail(400, "INVALID_INPUT", "Unknown export type.");
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="united-scale-${name}-${isoDate(new Date())}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return handleApiError(err, "Report export");
  }
}
