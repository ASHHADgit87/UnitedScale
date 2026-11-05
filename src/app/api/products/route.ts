import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LayerStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;

    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: true,
        inventoryLayers: {
          where: {
            status: LayerStatus.ACTIVE,
            remainingQty: { gt: 0 },
          },
          include: {
            warehouse: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          orderBy: {
            fifoDate: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const enriched = products.map((prod) => {
      const totalAvailable = prod.inventoryLayers.reduce(
        (sum, layer) => sum + Number(layer.remainingQty),
        0
      );
      const totalValuation = prod.inventoryLayers.reduce(
        (sum, layer) => sum + Number(layer.remainingQty) * Number(layer.unitCost),
        0
      );
      const oldestActiveLayer = prod.inventoryLayers[0] || null;

      return {
        ...prod,
        totalAvailable,
        totalValuation,
        oldestActiveLayerCost: oldestActiveLayer ? Number(oldestActiveLayer.unitCost) : null,
        activeLayerCount: prod.inventoryLayers.length,
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (err: unknown) {
    console.error("Products API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch products.",
      },
      { status: 500 }
    );
  }
}

