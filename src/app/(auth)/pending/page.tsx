import { redirect } from "next/navigation";
import { getCurrentUser, mirrorToAuth } from "@/lib/auth";
import PendingView from "@/components/auth/PendingView";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
  const user = await getCurrentUser();

  if (user?.status === "ACTIVE") {
    try {
      await mirrorToAuth({
        supabaseId: user.supabaseId,
        role: user.role,
        status: user.status,
      });
    } catch (err) {
      console.error("Auth mirror failed:", err);
      return <PendingView state="error" email={user.email} />;
    }
    redirect("/");
  }

  const state = !user
    ? "error"
    : user.status === "SUSPENDED"
      ? "suspended"
      : "pending";

  return <PendingView state={state} email={user?.email ?? null} />;
}
