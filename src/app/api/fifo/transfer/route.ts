import { NextRequest, NextResponse } from "next/server";
import { transferStock } from "@/lib/fifo-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, fromWarehouseId, toWarehouseId, quantity, performedById, notes } = body;

    if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
      return NextResponse.json(
        { error: "productId, fromWarehouseId, toWarehouseId, and quantity are required." },
        { status: 400 }
      );
    }

    const result = await transferStock({
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      performedById,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${quantity} units across warehouses with zero financial distortion.`,
      data: result,
    });
  } catch (err: unknown) {
    console.error("Transfer error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Stock transfer failed.",
      },
      { status: 500 }
    );
  }
}

