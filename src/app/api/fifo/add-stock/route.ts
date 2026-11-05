import { NextRequest, NextResponse } from "next/server";
import { addStockLayer } from "@/lib/fifo-engine";
import { LayerSource } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      warehouseId,
      quantity,
      unitCost,
      batchNumber,
      source,
      sourceReference,
      fifoDate,
      performedById,
      notes,
    } = body;

    if (!productId || !warehouseId || !quantity || unitCost === undefined) {
      return NextResponse.json(
        { error: "productId, warehouseId, quantity, and unitCost are required." },
        { status: 400 }
      );
    }

    const result = await addStockLayer({
      productId,
      warehouseId,
      quantity,
      unitCost,
      batchNumber,
      source: source || LayerSource.PURCHASE,
      sourceReference,
      fifoDate: fifoDate ? new Date(fifoDate) : undefined,
      performedById,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `New FIFO layer created successfully with unit cost of PKR ${unitCost}.`,
      data: result,
    });
  } catch (err: unknown) {
    console.error("Add stock layer error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to add stock layer.",
      },
      { status: 500 }
    );
  }
}

