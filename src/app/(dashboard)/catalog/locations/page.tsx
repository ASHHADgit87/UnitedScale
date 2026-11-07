import { redirect } from "next/navigation";
import { Role, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/PageKit";
import LocationManager, { type LocationRow } from "./LocationManager";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const me = await getCurrentUser();
  if (!me || me.status !== "ACTIVE" || !OFFICE_ROLES.includes(me.role)) {
    redirect("/");
  }

  const [warehouses, managers] = await Promise.all([
    prisma.warehouse.findMany({
      orderBy: [{ isHeadquarters: "desc" }, { name: "asc" }],
      include: {
        manager: { select: { name: true } },
        _count: { select: { inventoryLayers: true } },
      },
    }),

    prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
        role: { in: [Role.ADMIN, Role.MANAGER] },
        supabaseId: { not: null },
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: LocationRow[] = warehouses.map((warehouse) => ({
    id: warehouse.id,
    name: warehouse.name,
    code: warehouse.code,
    location: warehouse.location,
    city: warehouse.city,
    isHeadquarters: warehouse.isHeadquarters,
    managerId: warehouse.managerId,
    managerName: warehouse.manager?.name ?? null,
    batchCount: warehouse._count.inventoryLayers,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Catalog"
        title="Locations"
        description="Warehouses, godowns and offices where stock is held. Receipts and transfers use this list."
      />
      <LocationManager
        locations={rows}
        managers={managers}
        canDelete={me.role === "ADMIN"}
      />
    </div>
  );
}
