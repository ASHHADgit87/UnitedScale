import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { ADMIN_ROLES, OFFICE_ROLES } from "@/lib/permissions";
import { fail, isId } from "@/lib/api-utils";
import {
  handleMasterError,
  managerExists,
  readBody,
  readWarehouse,
} from "@/lib/master-data";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isId(id)) return fail(400, "INVALID_ID", "Invalid location id.");

  const parsed = readWarehouse(await readBody(req));
  if (!parsed.ok) return fail(400, "VALIDATION_ERROR", parsed.message);
  const input = parsed.data;

  try {
    if (input.managerId && !(await managerExists(input.managerId))) {
      return fail(
        400,
        "INVALID_REFERENCE",
        "Choose an active administrator or manager.",
      );
    }

    const warehouse = await prisma.$transaction(async (tx) => {
      if (input.isHeadquarters) {
        await tx.warehouse.updateMany({
          where: { id: { not: id } },
          data: { isHeadquarters: false },
        });
      }
      return tx.warehouse.update({ where: { id }, data: input });
    });

    return NextResponse.json({ success: true, data: warehouse });
  } catch (err) {
    return handleMasterError(err, "Update warehouse");
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const auth = await requireApiUser(ADMIN_ROLES);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isId(id)) return fail(400, "INVALID_ID", "Invalid location id.");

  try {
    const usage = await prisma.warehouse.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            inventoryLayers: true,
            sourceMovements: true,
            destMovements: true,
          },
        },
      },
    });
    if (!usage)
      return fail(404, "NOT_FOUND", "That location no longer exists.");

    const { inventoryLayers, sourceMovements, destMovements } = usage._count;
    if (inventoryLayers + sourceMovements + destMovements > 0) {
      return fail(
        409,
        "IN_USE",
        "This location has stock history, so it cannot be deleted.",
      );
    }

    await prisma.warehouse.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleMasterError(err, "Delete warehouse");
  }
}
