import { notFound, redirect } from "next/navigation";
import { CertStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { readResults } from "@/lib/calibration";
import { PageHeader } from "@/components/layout/PageKit";
import CertificateForm, {
  type CertificateFormValues,
} from "../../CertificateForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCertificatePage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/pending");

  const { id } = await params;
  const [certificate, products] = await Promise.all([
    prisma.calibrationCertificate.findUnique({ where: { id } }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true },
    }),
  ]);
  if (!certificate) notFound();

  const editable =
    certificate.status === CertStatus.DRAFT ||
    certificate.status === CertStatus.REJECTED;
  const allowed =
    OFFICE_ROLES.includes(user.role) ||
    certificate.inspectorTechnicianId === user.id;
  if (!editable || !allowed) redirect(`/calibration/${id}`);

  const results = readResults(
    certificate.calibrationResults,
    Number(certificate.readability),
  );
  const optional = (value: unknown) =>
    value === null || value === undefined ? "" : String(Number(value));

  const initial: CertificateFormValues = {
    clientName: certificate.clientName,
    clientAddress: certificate.clientAddress ?? "",
    clientContact: certificate.clientContact ?? "",
    productId: certificate.productId ?? "",
    equipmentModel: certificate.equipmentModel,
    serialNumber: certificate.serialNumber,
    nominalCapacity: String(Number(certificate.nominalCapacity)),
    readability: String(Number(certificate.readability)),
    calibrationDate: certificate.calibrationDate.toISOString().slice(0, 10),
    nextDueDate: certificate.nextDueDate.toISOString().slice(0, 10),
    environmentalTemp: optional(certificate.environmentalTemp),
    environmentalHumidity: optional(certificate.environmentalHumidity),
    standardWeightUsed: certificate.standardWeightUsed ?? "",
    notes: certificate.notes ?? "",
    zeroError: String(results?.zeroError ?? 0),
    repeatabilityMaxError: String(results?.repeatabilityMaxError ?? 0),
    eccentricityMaxError: String(results?.eccentricityMaxError ?? 0),
    points: (results?.linearityPoints ?? []).map((point) => ({
      applied: String(point.applied),
      indicated: String(point.indicated),
      mpe: String(point.mpe),
      custom: true,
    })),
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Calibration"
        title={`Edit ${certificate.certificateNumber}`}
        description="Change the details, then save or submit the certificate for approval."
      />
      <CertificateForm
        mode="edit"
        certificateId={id}
        products={products}
        initial={initial}
      />
    </div>
  );
}
