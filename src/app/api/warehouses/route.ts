import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { APP_ROLES, OFFICE_ROLES } from "@/lib/permissions";
import { fail, handleApiError } from "@/lib/api-utils";
import {
  handleMasterError,
  managerExists,
  readBody,
  readWarehouse,
} from "@/lib/master-data";

export async function GET() {
  const auth = await requireApiUser(APP_ROLES);
  if (!auth.ok) return auth.response;

  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        manager: { select: { id: true, name: true } },
        _count: {
          select: {
            inventoryLayers: true,
            sourceMovements: true,
            destMovements: true,
          },
        },
      },
      orderBy: { isHeadquarters: "desc" },
    });

    return NextResponse.json({ success: true, data: warehouses });
  } catch (err) {
    return handleApiError(err, "Fetch warehouses");
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

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
        await tx.warehouse.updateMany({ data: { isHeadquarters: false } });
      }
      return tx.warehouse.create({ data: input });
    });

    return NextResponse.json(
      { success: true, data: warehouse },
      { status: 201 },
    );
  } catch (err) {
    return handleMasterError(err, "Create warehouse");
  }
}
