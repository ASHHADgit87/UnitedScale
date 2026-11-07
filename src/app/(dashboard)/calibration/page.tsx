import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Award,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  TriangleAlert,
} from "lucide-react";
import { CertStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { buildHref, first, type SearchParams } from "@/lib/query";
import {
  STATUS_LABELS,
  dueInfo,
  effectiveStatus,
  type CertificateStatus,
} from "@/lib/calibration";
import { buttonVariants } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  EmptyState,
  FilterLink,
  PageHeader,
  Pagination,
  Panel,
  StatCard,
} from "@/components/layout/PageKit";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const FILTERS = [
  { key: "draft", label: "Drafts" },
  { key: "pending", label: "Awaiting approval" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "due", label: "Due soon or expired" },
] as const;

const STATUS_VARIANT: Record<CertificateStatus, BadgeProps["variant"]> = {
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
  searchParams: Promise<SearchParams>;
}

export default async function CalibrationPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/pending");

  const params = await searchParams;
  const filter = FILTERS.find((item) => item.key === first(params.status))?.key;
  const query = first(params.q)?.trim().slice(0, 80);
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * 86_400_000);

  const statusWhere: Prisma.CalibrationCertificateWhereInput =
    filter === "draft"
      ? { status: CertStatus.DRAFT }
      : filter === "pending"
        ? { status: CertStatus.PENDING_INSPECTION }
        : filter === "approved"
          ? {
              status: CertStatus.APPROVED_GOVT_SINDH,
              nextDueDate: { gte: now },
            }
          : filter === "rejected"
            ? { status: CertStatus.REJECTED }
            : filter === "due"
              ? {
                  status: CertStatus.APPROVED_GOVT_SINDH,
                  nextDueDate: { lte: soon },
                }
              : {};

  const searchWhere: Prisma.CalibrationCertificateWhereInput = query
    ? {
        OR: [
          { clientName: { contains: query, mode: "insensitive" } },
          { certificateNumber: { contains: query, mode: "insensitive" } },
          { serialNumber: { contains: query, mode: "insensitive" } },
          { equipmentModel: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const where: Prisma.CalibrationCertificateWhereInput = {
    AND: [statusWhere, searchWhere],
  };

  const [total, valid, pending, due, matching] = await Promise.all([
    prisma.calibrationCertificate.count(),
    prisma.calibrationCertificate.count({
      where: {
        status: CertStatus.APPROVED_GOVT_SINDH,
        nextDueDate: { gte: now },
      },
    }),
    prisma.calibrationCertificate.count({
      where: { status: CertStatus.PENDING_INSPECTION },
    }),
    prisma.calibrationCertificate.count({
      where: {
        status: CertStatus.APPROVED_GOVT_SINDH,
        nextDueDate: { lte: soon },
      },
    }),
    prisma.calibrationCertificate.count({ where }),
  ]);

  const pageCount = Math.max(1, Math.ceil(matching / PAGE_SIZE));
  const page = Math.min(
    Math.max(1, Number(first(params.page)) || 1),
    pageCount,
  );

  const certificates = await prisma.calibrationCertificate.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      certificateNumber: true,
      clientName: true,
      equipmentModel: true,
      serialNumber: true,
      calibrationDate: true,
      nextDueDate: true,
      status: true,
    },
  });

  const hrefFor = (overrides: Record<string, string | undefined>) =>
    buildHref("/calibration", { status: filter, q: query, ...overrides });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Calibration"
        title="Calibration certificates"
        description="Record calibrations, send them for approval and print certificates for your clients."
        actions={
          <Link href="/calibration/new" className={buttonVariants()}>
            <Plus className="h-4 w-4" />
            New certificate
          </Link>
        }
      />

      <div className="flex flex-wrap gap-4">
        <StatCard
          label="Certificates"
          value={String(total)}
          note="On record"
          icon={Award}
          accent
        />
        <StatCard
          label="Valid"
          value={String(valid)}
          note="Approved and in date"
          icon={CheckCircle2}
        />
        <StatCard
          label="Awaiting approval"
          value={String(pending)}
          note="Submitted by inspectors"
          icon={Clock3}
        />
        <StatCard
          label="Due soon or expired"
          value={String(due)}
          note="Within 30 days or overdue"
          icon={TriangleAlert}
        />
      </div>

      <Panel
        title="Certificates"
        subtitle={`${matching} ${matching === 1 ? "result" : "results"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterLink
              href={hrefFor({ status: undefined, page: undefined })}
              active={!filter}
            >
              All
            </FilterLink>
            {FILTERS.map((item) => (
              <FilterLink
                key={item.key}
                href={hrefFor({ status: item.key, page: undefined })}
                active={filter === item.key}
              >
                {item.label}
              </FilterLink>
            ))}
          </div>

          <form
            method="get"
            action="/calibration"
            className="flex items-center gap-2"
          >
            {filter && <input type="hidden" name="status" value={filter} />}
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-zinc-500" />
              <input
                name="q"
                defaultValue={query ?? ""}
                placeholder="Client, number or serial"
                className="h-9 w-56 rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/70"
              />
            </div>
            <button
              type="submit"
              className="h-9 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 text-xs font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/[0.08]"
            >
              Search
            </button>
          </form>
        </div>

        {certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates found"
            description="Create a certificate to record a calibration for a client."
            action={
              <Link
                href="/calibration/new"
                className={buttonVariants({ size: "sm" })}
              >
                <Plus className="h-4 w-4" />
                New certificate
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  <th className="px-5 py-3 font-medium">Certificate</th>
                  <th className="px-3 py-3 font-medium">Instrument</th>
                  <th className="px-3 py-3 font-medium">Calibrated</th>
                  <th className="px-3 py-3 font-medium">Valid until</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {certificates.map((certificate) => {
                  const status = effectiveStatus(
                    certificate.status,
                    certificate.nextDueDate,
                  );
                  const due = dueInfo(certificate.nextDueDate);
                  return (
                    <tr
                      key={certificate.id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/calibration/${certificate.id}`}
                          className="flex flex-col"
                        >
                          <span className="font-medium text-white hover:text-red-300">
                            {certificate.certificateNumber}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {certificate.clientName}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-zinc-200">
                            {certificate.equipmentModel}
                          </span>
                          <span className="text-xs text-zinc-500">
                            S/N {certificate.serialNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-zinc-400">
                        {formatDate(certificate.calibrationDate)}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-zinc-300">
                            {formatDate(certificate.nextDueDate)}
                          </span>
                          {certificate.status ===
                            CertStatus.APPROVED_GOVT_SINDH && (
                            <span
                              className={`text-xs font-semibold ${toneClass[due.tone]}`}
                            >
                              {due.text}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Badge variant={STATUS_VARIANT[status]}>
                          {STATUS_LABELS[status]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          pageCount={pageCount}
          hrefFor={(target) =>
            hrefFor({ page: target === 1 ? undefined : String(target) })
          }
        />
      </Panel>
    </div>
  );
}
