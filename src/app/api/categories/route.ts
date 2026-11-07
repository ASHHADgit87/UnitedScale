import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { APP_ROLES, OFFICE_ROLES } from "@/lib/permissions";
import { fail, handleApiError } from "@/lib/api-utils";
import { handleMasterError, readBody, readCategory } from "@/lib/master-data";

export async function GET() {
  const auth = await requireApiUser(APP_ROLES);
  if (!auth.ok) return auth.response;

  try {
    const categories = await prisma.productCategory.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    return handleApiError(err, "Fetch categories");
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

  const parsed = readCategory(await readBody(req));
  if (!parsed.ok) return fail(400, "VALIDATION_ERROR", parsed.message);

  try {
    const category = await prisma.productCategory.create({ data: parsed.data });
    return NextResponse.json(
      { success: true, data: category },
      { status: 201 },
    );
  } catch (err) {
    return handleMasterError(err, "Create category");
  }
}
