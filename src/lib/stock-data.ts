import { LayerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface StockLayer {
  id: string;
  warehouseId: string;
  batchNumber: string | null;
  remaining: number;
  unitCost: number;
  fifoDate: string;
}

export interface StockProduct {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  unit: string;
  sellingPrice: number;
  layers: StockLayer[];
}

export interface StockLocation {
  id: string;
  name: string;
  code: string;
}

export async function loadStockOptions(): Promise<{
  products: StockProduct[];
  locations: StockLocation[];
}> {
  const [products, locations] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        sku: true,
        name: true,
        brand: true,
        unit: true,
        sellingPrice: true,
        inventoryLayers: {
          where: { status: LayerStatus.ACTIVE, remainingQty: { gt: 0 } },
          orderBy: { fifoDate: "asc" },
          select: {
            id: true,
            warehouseId: true,
            batchNumber: true,
            remainingQty: true,
            unitCost: true,
            fifoDate: true,
          },
        },
      },
    }),
    prisma.warehouse.findMany({
      orderBy: [{ isHeadquarters: "desc" }, { name: "asc" }],
      select: { id: true, name: true, code: true },
    }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      unit: product.unit,
      sellingPrice: Number(product.sellingPrice),
      layers: product.inventoryLayers.map((layer) => ({
        id: layer.id,
        warehouseId: layer.warehouseId,
        batchNumber: layer.batchNumber,
        remaining: Number(layer.remainingQty),
        unitCost: Number(layer.unitCost),
        fifoDate: layer.fifoDate.toISOString(),
      })),
    })),
    locations,
  };
}
