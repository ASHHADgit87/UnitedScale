import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.status !== "ACTIVE") redirect("/pending");

  const pendingCount =
    user.role === "ADMIN"
      ? await prisma.user.count({
          where: { status: "PENDING", supabaseId: { not: null } },
        })
      : 0;

  return (
    <DashboardLayout
      user={{ name: user.name, email: user.email, role: user.role }}
      pendingCount={pendingCount}
    >
      {children}
    </DashboardLayout>
  );
}
