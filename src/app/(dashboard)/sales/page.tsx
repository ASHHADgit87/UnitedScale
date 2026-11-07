import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { loadStockOptions } from "@/lib/stock-data";
import { PageHeader } from "@/components/layout/PageKit";
import SalesForm from "./SalesForm";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE" || !OFFICE_ROLES.includes(user.role))
    redirect("/");

  const { products, locations } = await loadStockOptions();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Operations"
        title="Sales"
        description="Record a sale. Stock is taken from the oldest batch first and costed automatically."
      />
      <SalesForm products={products} locations={locations} />
    </div>
  );
}
