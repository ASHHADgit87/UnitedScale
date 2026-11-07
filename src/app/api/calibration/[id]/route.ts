import { NextRequest, NextResponse } from "next/server";
import { CertStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/auth";
import { APP_ROLES, OFFICE_ROLES } from "@/lib/permissions";
import { clip, fail, handleApiError, isId } from "@/lib/api-utils";
import { parseCertificateInput } from "@/lib/calibration";
import { certificateFields } from "@/lib/calibration-db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const auth = await requireApiUser(APP_ROLES);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isId(id)) return fail(400, "INVALID_INPUT", "Invalid certificate.");

  const body = await req.json().catch(() => null);
  const action: unknown = body?.action;

  try {
    const certificate = await prisma.calibrationCertificate.findUnique({
      where: { id },
      select: { status: true, inspectorTechnicianId: true, notes: true },
    });
    if (!certificate) return fail(404, "NOT_FOUND", "Certificate not found.");

    const isOffice = OFFICE_ROLES.includes(auth.user.role);

    if (action === "update" || action === "submit") {
      const editable =
        certificate.status === CertStatus.DRAFT ||
        certificate.status === CertStatus.REJECTED;
      if (!editable) {
        return fail(
          409,
          "INVALID_STATE",
          "Only drafts and rejected certificates can be changed.",
        );
      }
      if (!isOffice && certificate.inspectorTechnicianId !== auth.user.id) {
        return fail(
          403,
          "FORBIDDEN",
          "Only the inspector or a manager can change this certificate.",
        );
      }

      if (action === "update") {
        const parsed = parseCertificateInput(body);
        if (!parsed.ok) return fail(400, "INVALID_INPUT", parsed.message);
        await prisma.calibrationCertificate.update({
          where: { id },
          data: {
            ...certificateFields(parsed.data),
            ...(body?.submit === true
              ? { status: CertStatus.PENDING_INSPECTION }
              : {}),
          },
        });
      } else {
        await prisma.calibrationCertificate.update({
          where: { id },
          data: { status: CertStatus.PENDING_INSPECTION },
        });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "approve" || action === "reject") {
      if (!isOffice)
        return fail(
          403,
          "FORBIDDEN",
          "Only a manager or administrator can do this.",
        );
      if (certificate.status !== CertStatus.PENDING_INSPECTION) {
        return fail(
          409,
          "INVALID_STATE",
          "Only certificates awaiting approval can be approved or rejected.",
        );
      }

      if (action === "approve") {
        const verificationNo = clip(body?.verificationNo, 64);
        if (!verificationNo) {
          return fail(
            400,
            "INVALID_INPUT",
            "Enter the Govt. of Sindh verification number.",
          );
        }
        await prisma.calibrationCertificate.update({
          where: { id },
          data: {
            status: CertStatus.APPROVED_GOVT_SINDH,
            govtSindhVerificationNo: verificationNo,
          },
        });
      } else {
        const reason = clip(body?.reason, 300);
        if (!reason)
          return fail(400, "INVALID_INPUT", "Enter the reason for rejecting.");
        await prisma.calibrationCertificate.update({
          where: { id },
          data: {
            status: CertStatus.REJECTED,
            notes: `${certificate.notes ? `${certificate.notes}\n` : ""}Rejected: ${reason}`,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    return fail(400, "INVALID_ACTION", "Unknown action.");
  } catch (err) {
    return handleApiError(err, "Update certificate");
  }
}
