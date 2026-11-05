import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LayerStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const warehouseId = searchParams.get("warehouseId") || undefined;
    const statusParam = searchParams.get("status");

    let status: LayerStatus | undefined = undefined;
    if (statusParam === "ACTIVE") status = LayerStatus.ACTIVE;
    if (statusParam === "DEPLETED") status = LayerStatus.DEPLETED;

    const layers = await prisma.inventoryLayer.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(warehouseId ? { warehouseId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            brand: true,
            unit: true,
          },
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
            isHeadquarters: true,
          },
        },
      },
      orderBy: {
        fifoDate: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      count: layers.length,
      data: layers,
    });
  } catch (err: unknown) {
    console.error("Error fetching FIFO layers:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch inventory layers",
      },
      { status: 500 }
    );
  }
}

