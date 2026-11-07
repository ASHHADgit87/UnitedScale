import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { ADMIN_ROLES, OFFICE_ROLES } from "@/lib/permissions";
import { fail, isId } from "@/lib/api-utils";
import { handleMasterError, readBody, readProduct } from "@/lib/master-data";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isId(id)) return fail(400, "INVALID_ID", "Invalid product id.");

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

    const product = await prisma.product.update({ where: { id }, data: input });
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    return handleMasterError(err, "Update product");
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const auth = await requireApiUser(ADMIN_ROLES);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isId(id)) return fail(400, "INVALID_ID", "Invalid product id.");

  try {
    const usage = await prisma.product.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            inventoryLayers: true,
            stockMovements: true,
            calibrations: true,
          },
        },
      },
    });
    if (!usage) return fail(404, "NOT_FOUND", "That product no longer exists.");

    const { inventoryLayers, stockMovements, calibrations } = usage._count;
    if (inventoryLayers + stockMovements + calibrations > 0) {
      return fail(
        409,
        "IN_USE",
        "This product has stock history or certificates, so it cannot be deleted.",
      );
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleMasterError(err, "Delete product");
  }
}
