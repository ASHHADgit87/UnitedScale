import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OFFICE_ROLES } from "@/lib/permissions";
import { PageHeader } from "@/components/layout/PageKit";
import ProductManager, { type ProductRow } from "./ProductManager";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const me = await getCurrentUser();
  if (!me || me.status !== "ACTIVE" || !OFFICE_ROLES.includes(me.role)) {
    redirect("/");
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { category: { select: { name: true } } },
    }),
    prisma.productCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: ProductRow[] = products.map((product) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    brand: product.brand,
    model: product.model,
    capacity: product.capacity,
    resolution: product.resolution,
    unit: product.unit,
    hasSerialPort: product.hasSerialPort,
    rs232Protocol: product.rs232Protocol,
    minStockLevel: Number(product.minStockLevel),
    sellingPrice: Number(product.sellingPrice),
    categoryId: product.categoryId,
    categoryName: product.category.name,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Every item you buy, sell and calibrate. Purchasing, sales and transfers pick from this list."
      />
      <ProductManager
        products={rows}
        categories={categories}
        canDelete={me.role === "ADMIN"}
      />
    </div>
  );
}
