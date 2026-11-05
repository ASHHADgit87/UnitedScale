import { NextRequest, NextResponse } from "next/server";
import { deductStock, InsufficientStockError } from "@/lib/fifo-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, warehouseId, quantity, performedById, reason, notes } = body;

    if (!productId || !warehouseId || !quantity) {
      return NextResponse.json(
        { error: "productId, warehouseId, and quantity are required." },
        { status: 400 }
      );
    }

    const result = await deductStock({
      productId,
      warehouseId,
      quantity,
      performedById,
      reason: reason || "Sales Order Execution",
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deducted ${quantity} units using Strict FIFO Costing.`,
      data: result,
    });
  } catch (err: unknown) {
    if (err instanceof InsufficientStockError) {
      return NextResponse.json(
        {
          success: false,
          error: "INSUFFICIENT_STOCK",
          message: err.message,
          requestedQty: err.requestedQty,
          availableQty: err.availableQty,
        },
        { status: 400 }
      );
    }

    console.error("FIFO deduction error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: err instanceof Error ? err.message : "Unknown error during FIFO deduction.",
      },
      { status: 500 }
    );
  }
}

