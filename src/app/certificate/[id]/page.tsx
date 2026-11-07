import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { readResults } from "@/lib/calibration";
import PrintButton from "@/components/layout/PrintButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const longDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#71717a]">
        {label}
      </span>
      <span className="text-[13px] font-medium text-[#18181b]">{value}</span>
    </div>
  );
}

export default async function PrintableCertificatePage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/pending");

  const { id } = await params;
  const certificate = await prisma.calibrationCertificate.findUnique({
    where: { id },
    include: { inspector: { select: { name: true } } },
  });
  if (!certificate) notFound();

  const approved = certificate.status === "APPROVED_GOVT_SINDH";
  const results = readResults(
    certificate.calibrationResults,
    Number(certificate.readability),
  );
  const optional = (value: unknown, suffix: string) =>
    value === null || value === undefined ? "—" : `${Number(value)} ${suffix}`;

  return (
    <div className="min-h-screen bg-[#e4e4e7] px-4 py-8 text-[#18181b] print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex w-full max-w-[794px] items-center justify-between print:hidden">
        <Link
          href={`/calibration/${certificate.id}`}
          className="flex items-center gap-2 text-sm font-medium text-[#3f3f46] hover:text-[#18181b]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to certificate
        </Link>
        <PrintButton />
      </div>

      <div className="relative mx-auto w-full max-w-[794px] overflow-hidden bg-[#ffffff] p-10 shadow-xl print:max-w-none print:p-8 print:shadow-none">
        {!approved && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="-rotate-[28deg] whitespace-nowrap text-6xl font-bold uppercase tracking-widest text-[#dc2626] opacity-[0.12]">
              Draft · Not valid
            </span>
          </div>
        )}

        <div className="relative flex flex-col gap-7">
          <div className="flex items-start justify-between gap-6 border-b-2 border-[#b91c1c] pb-5">
            <div className="flex flex-col gap-2">
              <img
                src="/logo-light.png"
                alt="United Scale"
                className="h-14 w-auto object-contain object-left"
              />
              <span className="text-[11px] leading-relaxed text-[#52525b]">
                Mashriq Centre, Sir Shah Suleman Road, Gulshan-e-Iqbal, Karachi
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#71717a]">
                Certificate number
              </span>
              <span className="text-lg font-semibold text-[#b91c1c]">
                {certificate.certificateNumber}
              </span>
              {approved && certificate.govtSindhVerificationNo && (
                <span className="text-[11px] text-[#52525b]">
                  Govt. of Sindh verification:{" "}
                  {certificate.govtSindhVerificationNo}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-[0.15em] text-[#18181b]">
              Calibration certificate
            </h1>
            <span className="text-xs text-[#71717a]">
              Weighing, counting and calibration
            </span>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-4 rounded-lg border border-[#d4d4d8] bg-[#f4f4f5] p-5">
            <div className="flex min-w-[240px] flex-1 flex-col gap-3">
              <Item label="Client" value={certificate.clientName} />
              <Item label="Address" value={certificate.clientAddress ?? "—"} />
              <Item label="Contact" value={certificate.clientContact ?? "—"} />
            </div>
            <div className="flex min-w-[240px] flex-1 flex-col gap-3">
              <Item label="Instrument" value={certificate.equipmentModel} />
              <Item label="Serial number" value={certificate.serialNumber} />
              <Item
                label="Capacity · Readability"
                value={`${Number(certificate.nominalCapacity)} kg · ${Number(certificate.readability)} kg`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-4">
            <div className="flex min-w-[140px] flex-1 flex-col gap-3">
              <Item
                label="Calibration date"
                value={longDate(certificate.calibrationDate)}
              />
            </div>
            <div className="flex min-w-[140px] flex-1 flex-col gap-3">
              <Item
                label="Valid until"
                value={longDate(certificate.nextDueDate)}
              />
            </div>
            <div className="flex min-w-[140px] flex-1 flex-col gap-3">
              <Item
                label="Temperature"
                value={optional(certificate.environmentalTemp, "°C")}
              />
            </div>
            <div className="flex min-w-[140px] flex-1 flex-col gap-3">
              <Item
                label="Humidity"
                value={optional(certificate.environmentalHumidity, "%")}
              />
            </div>
          </div>

          <Item
            label="Standard weights used"
            value={certificate.standardWeightUsed ?? "—"}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#3f3f46]">
                Linearity test results
              </span>
              {results && (
                <span
                  className={`rounded border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${
                    results.overall === "PASS"
                      ? "border-[#18181b] text-[#18181b]"
                      : "border-[#b91c1c] text-[#b91c1c]"
                  }`}
                >
                  {results.overall}
                </span>
              )}
            </div>
            <table className="w-full border-collapse text-left text-[12px]">
              <thead>
                <tr className="border-y border-[#a1a1aa] bg-[#f4f4f5] text-[10px] uppercase tracking-wider text-[#52525b]">
                  <th className="px-3 py-2 font-semibold">Applied load</th>
                  <th className="px-3 py-2 font-semibold">Indication</th>
                  <th className="px-3 py-2 font-semibold">Error</th>
                  <th className="px-3 py-2 font-semibold">Allowed error ±</th>
                  <th className="px-3 py-2 text-right font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {(results?.linearityPoints ?? []).map((point) => (
                  <tr
                    key={`${point.applied}-${point.indicated}`}
                    className="border-b border-[#e4e4e7]"
                  >
                    <td className="px-3 py-2">{point.applied} kg</td>
                    <td className="px-3 py-2">{point.indicated} kg</td>
                    <td className="px-3 py-2">
                      {point.error > 0 ? "+" : ""}
                      {point.error} kg
                    </td>
                    <td className="px-3 py-2">{point.mpe} kg</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {point.pass ? "Pass" : "Fail"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results && (
              <span className="text-[11px] text-[#52525b]">
                Zero error {results.zeroError} kg · Repeatability{" "}
                {results.repeatabilityMaxError} kg · Eccentricity{" "}
                {results.eccentricityMaxError} kg
              </span>
            )}
          </div>

          {certificate.notes && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#71717a]">
                Remarks
              </span>
              <span className="whitespace-pre-line text-[12px] text-[#3f3f46]">
                {certificate.notes}
              </span>
            </div>
          )}

          <div className="flex items-end justify-between gap-10 pt-8">
            <div className="flex min-w-[200px] flex-col gap-1 border-t border-[#71717a] pt-2">
              <span className="text-[12px] font-medium">
                {certificate.inspector?.name ?? "—"}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#71717a]">
                Calibrated by
              </span>
            </div>
            <div className="flex min-w-[200px] flex-col gap-1 border-t border-[#71717a] pt-2">
              <span className="text-[12px] font-medium">&nbsp;</span>
              <span className="text-[10px] uppercase tracking-wider text-[#71717a]">
                Authorised signatory
              </span>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#71717a]">
            {approved
              ? "This certificate was approved and issued by United Scale."
              : "This document is a draft and is not a valid certificate until it is approved."}
          </p>
        </div>
      </div>
    </div>
  );
}
