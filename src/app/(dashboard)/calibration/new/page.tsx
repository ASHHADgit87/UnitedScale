import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageKit";
import CertificateForm from "../CertificateForm";

export const dynamic = "force-dynamic";

export default async function NewCertificatePage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/pending");

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, sku: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Calibration"
        title="New certificate"
        description="Record the instrument, the test results and the conditions. You can save a draft and finish later."
      />
      <CertificateForm mode="create" products={products} />
    </div>
  );
}
