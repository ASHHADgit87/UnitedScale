import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { ADMIN_ROLES, OFFICE_ROLES } from "@/lib/permissions";
import { fail, isId } from "@/lib/api-utils";
import { handleMasterError, readBody, readCategory } from "@/lib/master-data";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isId(id)) return fail(400, "INVALID_ID", "Invalid category id.");

  const parsed = readCategory(await readBody(req));
  if (!parsed.ok) return fail(400, "VALIDATION_ERROR", parsed.message);

  try {
    const category = await prisma.productCategory.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ success: true, data: category });
  } catch (err) {
    return handleMasterError(err, "Update category");
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const auth = await requireApiUser(ADMIN_ROLES);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isId(id)) return fail(400, "INVALID_ID", "Invalid category id.");

  try {
    const usage = await prisma.productCategory.findUnique({
      where: { id },
      select: { _count: { select: { products: true } } },
    });
    if (!usage)
      return fail(404, "NOT_FOUND", "That category no longer exists.");

    if (usage._count.products > 0) {
      return fail(
        409,
        "IN_USE",
        "This category still has products. Move or delete them first.",
      );
    }

    await prisma.productCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleMasterError(err, "Delete category");
  }
}
