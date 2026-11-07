import { NextRequest, NextResponse } from "next/server";
import { LayerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { APP_ROLES, OFFICE_ROLES } from "@/lib/permissions";
import { fail, handleApiError, isId } from "@/lib/api-utils";
import { handleMasterError, readBody, readProduct } from "@/lib/master-data";

export async function GET(req: NextRequest) {
  const auth = await requireApiUser(APP_ROLES);
  if (!auth.ok) return auth.response;

  const canSeeCosts = auth.user.role !== "TECHNICIAN";

  try {
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get("categoryId");
    const categoryId = isId(categoryParam) ? categoryParam : undefined;

    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        category: true,
        inventoryLayers: {
          where: { status: LayerStatus.ACTIVE, remainingQty: { gt: 0 } },
          include: {
            warehouse: { select: { id: true, name: true, code: true } },
          },
          orderBy: { fifoDate: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = products.map((product) => {
      const { inventoryLayers, ...rest } = product;
      const totalAvailable = inventoryLayers.reduce(
        (sum, layer) => sum + Number(layer.remainingQty),
        0,
      );
      const base = {
        ...rest,
        totalAvailable,
        activeLayerCount: inventoryLayers.length,
      };

      if (!canSeeCosts) return base;

      return {
        ...base,
        inventoryLayers,
        totalValuation: inventoryLayers.reduce(
          (sum, layer) =>
            sum + Number(layer.remainingQty) * Number(layer.unitCost),
          0,
        ),
        oldestActiveLayerCost: inventoryLayers[0]
          ? Number(inventoryLayers[0].unitCost)
          : null,
      };
    });

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (err) {
    return handleApiError(err, "Fetch products");
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

  const parsed = readProduct(await readBody(req));
  if (!parsed.ok) return fail(400, "VALIDATION_ERROR", parsed.message);
  const input = parsed.data;

  try {
    const category = await prisma.productCategory.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!category) {
      return fail(400, "INVALID_REFERENCE", "That category no longer exists.");
    }

    const product = await prisma.product.create({ data: input });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (err) {
    return handleMasterError(err, "Create product");
  }
}
