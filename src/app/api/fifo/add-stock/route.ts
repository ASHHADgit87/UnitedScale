import { NextRequest, NextResponse } from "next/server";
import { LayerSource } from "@prisma/client";
import { addStockLayer } from "@/lib/fifo-engine";
import { requireApiUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import {
  clip,
  fail,
  handleApiError,
  isId,
  parseCost,
  parseQuantity,
} from "@/lib/api-utils";

const ALLOWED_SOURCES: readonly LayerSource[] = [
  LayerSource.PURCHASE,
  LayerSource.OPENING_STOCK,
  LayerSource.ADJUSTMENT,
];

export async function POST(req: NextRequest) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const quantity = parseQuantity(body?.quantity);
  const unitCost = parseCost(body?.unitCost);

  if (
    !isId(body?.productId) ||
    !isId(body?.warehouseId) ||
    quantity === null ||
    unitCost === null
  ) {
    return fail(
      400,
      "INVALID_INPUT",
      "productId, warehouseId, a positive quantity and a valid unitCost are required.",
    );
  }

  const source =
    ALLOWED_SOURCES.find((item) => item === body.source) ??
    LayerSource.PURCHASE;

  let fifoDate: Date | undefined;
  if (auth.user.role === "ADMIN" && typeof body.fifoDate === "string") {
    const parsed = new Date(body.fifoDate);
    if (!Number.isNaN(parsed.getTime())) fifoDate = parsed;
  }

  try {
    const result = await addStockLayer({
      productId: body.productId,
      warehouseId: body.warehouseId,
      quantity,
      unitCost,
      batchNumber: clip(body.batchNumber, 64),
      source,
      sourceReference: clip(body.sourceReference, 120),
      fifoDate,
      performedById: auth.user.id,
      notes: clip(body.notes),
    });

    return NextResponse.json({
      success: true,
      message: `New stock batch created at PKR ${unitCost} per unit.`,
      data: result,
    });
  } catch (err) {
    return handleApiError(err, "Add stock");
  }
}
