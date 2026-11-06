import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mirrorToAuth, requireApiUser } from "@/lib/auth";
import { ADMIN_ROLES, isRole, isStatus } from "@/lib/permissions";
import { fail, handleApiError, isId } from "@/lib/api-utils";

export async function PATCH(req: NextRequest) {
  const auth = await requireApiUser(ADMIN_ROLES);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const userId: unknown = body?.userId;
  const role: unknown = body?.role;
  const status: unknown = body?.status;

  if (!isId(userId) || !isRole(role) || !isStatus(status)) {
    return fail(
      400,
      "INVALID_INPUT",
      "userId, a valid role and a valid status are required.",
    );
  }
  if (userId === auth.user.id) {
    return fail(400, "SELF_CHANGE", "You cannot change your own access.");
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target || !target.supabaseId)
      return fail(404, "NOT_FOUND", "Account not found.");

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role, status },
      select: { id: true, role: true, status: true },
    });

    try {
      await mirrorToAuth({
        supabaseId: target.supabaseId,
        role: updated.role,
        status: updated.status,
      });
    } catch (err) {
      console.error("Auth mirror failed:", err);
      return fail(
        502,
        "SYNC_FAILED",
        "Saved, but the sign-in profile could not be refreshed. Try the same action again.",
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return handleApiError(err, "Update user access");
  }
}
