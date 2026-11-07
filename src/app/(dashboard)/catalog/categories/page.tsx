import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/PageKit";
import CategoryManager, { type CategoryRow } from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const me = await getCurrentUser();
  if (!me || me.status !== "ACTIVE" || !OFFICE_ROLES.includes(me.role)) {
    redirect("/");
  }

  const categories = await prisma.productCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const rows: CategoryRow[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    code: category.code,
    description: category.description,
    productCount: category._count.products,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Group products such as indicators, load cells and platform scales."
      />
      <CategoryManager categories={rows} canDelete={me.role === "ADMIN"} />
    </div>
  );
}
