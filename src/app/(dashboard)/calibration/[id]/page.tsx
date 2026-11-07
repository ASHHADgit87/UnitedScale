import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import {
  STATUS_LABELS,
  dueInfo,
  effectiveStatus,
  readResults,
  TOLERANCE_NOTE,
} from "@/lib/calibration";
import { buttonVariants } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { PageHeader, Panel } from "@/components/layout/PageKit";
import CertificateActions from "./CertificateActions";

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  DRAFT: "secondary",
  PENDING_INSPECTION: "warning",
  APPROVED_GOVT_SINDH: "success",
  REJECTED: "destructive",
  EXPIRED: "destructive",
};

const toneClass = {
  ok: "text-zinc-400",
  soon: "text-red-300",
  late: "text-red-400",
} as const;

interface PageProps {
  params: Promise<{ id: string }>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-2.5 text-sm last:border-b-0">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-100">{value}</span>
    </div>
  );
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/pending");

  const { id } = await params;
  const certificate = await prisma.calibrationCertificate.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, sku: true } },
      inspector: { select: { name: true } },
    },
  });
  if (!certificate) notFound();

  const status = effectiveStatus(certificate.status, certificate.nextDueDate);
  const due = dueInfo(certificate.nextDueDate);
  const results = readResults(
    certificate.calibrationResults,
    Number(certificate.readability),
  );
  const isOffice = OFFICE_ROLES.includes(user.role);
  const canEdit = isOffice || certificate.inspectorTechnicianId === user.id;

  const optional = (value: unknown, suffix: string) =>
    value === null || value === undefined ? "—" : `${Number(value)} ${suffix}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Calibration"
        title={certificate.certificateNumber}
        description={`${certificate.clientName} · ${certificate.equipmentModel}`}
        actions={
          <>
            <Link
              href="/calibration"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <ArrowLeft className="h-4 w-4" />
              All certificates
            </Link>
            <a
              href={`/certificate/${certificate.id}`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "sm" })}
            >
              <FileText className="h-4 w-4" />
              Printable certificate
            </a>
          </>
        }
      />

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Panel
            title="Details"
            action={
              <Badge variant={STATUS_VARIANT[status]}>
                {STATUS_LABELS[status]}
              </Badge>
            }
          >
            <div className="flex flex-col px-5 py-2">
              <Row label="Client" value={certificate.clientName} />
              <Row label="Address" value={certificate.clientAddress ?? "—"} />
              <Row label="Contact" value={certificate.clientContact ?? "—"} />
              <Row label="Instrument" value={certificate.equipmentModel} />
              <Row label="Serial number" value={certificate.serialNumber} />
              <Row
                label="Catalogue product"
                value={
                  certificate.product
                    ? `${certificate.product.name} (${certificate.product.sku})`
                    : "—"
                }
              />
              <Row
                label="Capacity"
                value={`${Number(certificate.nominalCapacity)} kg`}
              />
              <Row
                label="Readability"
                value={`${Number(certificate.readability)} kg`}
              />
              <Row
                label="Temperature"
                value={optional(certificate.environmentalTemp, "°C")}
              />
              <Row
                label="Humidity"
                value={optional(certificate.environmentalHumidity, "%")}
              />
              <Row
                label="Standard weights"
                value={certificate.standardWeightUsed ?? "—"}
              />
            </div>
          </Panel>

          <Panel
            title="Test results"
            subtitle={TOLERANCE_NOTE}
            action={
              results ? (
                <Badge
                  variant={
                    results.overall === "PASS" ? "success" : "destructive"
                  }
                >
                  {results.overall}
                </Badge>
              ) : undefined
            }
          >
            {results && results.linearityPoints.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      <th className="px-5 py-3 font-medium">Applied</th>
                      <th className="px-3 py-3 font-medium">Indicated</th>
                      <th className="px-3 py-3 font-medium">Error</th>
                      <th className="px-3 py-3 font-medium">Allowed ±</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {results.linearityPoints.map((point) => (
                      <tr key={`${point.applied}-${point.indicated}`}>
                        <td className="px-5 py-3 tabular-nums text-white">
                          {point.applied} kg
                        </td>
                        <td className="px-3 py-3 tabular-nums text-zinc-300">
                          {point.indicated} kg
                        </td>
                        <td className="px-3 py-3 tabular-nums text-zinc-300">
                          {point.error > 0 ? "+" : ""}
                          {point.error} kg
                        </td>
                        <td className="px-3 py-3 tabular-nums text-zinc-400">
                          {point.mpe} kg
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Badge
                            variant={point.pass ? "success" : "destructive"}
                          >
                            {point.pass ? "Pass" : "Fail"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex flex-wrap gap-6 border-t border-white/10 px-5 py-3 text-xs text-zinc-500">
                  <span>Zero error: {results.zeroError} kg</span>
                  <span>Repeatability: {results.repeatabilityMaxError} kg</span>
                  <span>Eccentricity: {results.eccentricityMaxError} kg</span>
                </div>
              </div>
            ) : (
              <p className="p-5 text-sm text-zinc-500">
                No test points recorded.
              </p>
            )}
          </Panel>

          {certificate.notes && (
            <Panel title="Notes">
              <p className="whitespace-pre-line p-5 text-sm text-zinc-300">
                {certificate.notes}
              </p>
            </Panel>
          )}
        </div>

        <div className="flex w-full flex-none flex-col gap-6 xl:w-[380px]">
          <Panel title="Workflow" subtitle="Draft, approval and issue.">
            <CertificateActions
              id={certificate.id}
              status={
                certificate.status === "EXPIRED"
                  ? "APPROVED_GOVT_SINDH"
                  : certificate.status
              }
              canEdit={canEdit}
              canApprove={isOffice}
            />
          </Panel>

          <Panel title="Record">
            <div className="flex flex-col px-5 py-2">
              <Row
                label="Calibrated on"
                value={formatDate(certificate.calibrationDate)}
              />
              <Row
                label="Valid until"
                value={formatDate(certificate.nextDueDate)}
              />
              <Row
                label="Inspector"
                value={certificate.inspector?.name ?? "—"}
              />
              <Row
                label="Verification number"
                value={certificate.govtSindhVerificationNo ?? "—"}
              />
              <Row label="Created" value={formatDate(certificate.createdAt)} />
            </div>
            {certificate.status === "APPROVED_GOVT_SINDH" && (
              <p
                className={`px-5 pb-4 text-xs font-semibold ${toneClass[due.tone]}`}
              >
                {due.text}
              </p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
