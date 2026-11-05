import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const limit = Number(searchParams.get("limit") || 50);

    const movements = await prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
          },
        },
        sourceWarehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        destWarehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        inventoryLayer: {
          select: {
            id: true,
            batchNumber: true,
            fifoDate: true,
            unitCost: true,
          },
        },
        performedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (err: unknown) {
    console.error("Movements API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch stock movements.",
      },
      { status: 500 }
    );
  }
}

