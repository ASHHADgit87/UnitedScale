import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { APP_ROLES } from "@/lib/permissions";
import { fail, handleApiError } from "@/lib/api-utils";
import { parseCertificateInput } from "@/lib/calibration";
import { createCertificate } from "@/lib/calibration-db";

export async function POST(req: NextRequest) {
  const auth = await requireApiUser(APP_ROLES);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = parseCertificateInput(body);
  if (!parsed.ok) return fail(400, "INVALID_INPUT", parsed.message);

  try {
    const created = await createCertificate(
      parsed.data,
      auth.user.id,
      body?.submit === true,
    );
    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    return handleApiError(err, "Create certificate");
  }
}
