import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            inventoryLayers: true,
            sourceMovements: true,
            destMovements: true,
          },
        },
      },
      orderBy: {
        isHeadquarters: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: warehouses,
    });
  } catch (err: unknown) {
    console.error("Warehouses API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch warehouses.",
      },
      { status: 500 }
    );
  }
}

