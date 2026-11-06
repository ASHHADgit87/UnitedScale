import { cache } from "react";
import { NextResponse } from "next/server";
import { Prisma, Role, UserStatus } from "@prisma/client";
import type { User as AuthUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/lib/permissions";

export interface CurrentUser {
  id: string;
  supabaseId: string;
  email: string;
  name: string;
  role: AppRole;
  status: UserStatus;
}

type GuardResult =
  | { ok: true; user: CurrentUser }
  | { ok: false; response: NextResponse };

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const deny = (status: number, error: string, message: string): GuardResult => ({
  ok: false,
  response: NextResponse.json({ success: false, error, message }, { status }),
});

async function provisionProfile(authUser: AuthUser, email: string) {
  const name = clean(authUser.user_metadata?.name, 80) || email.split("@")[0];
  const phone = clean(authUser.user_metadata?.phone, 32) || null;

  const claimed = await prisma.user.updateMany({
    where: { email, supabaseId: null },
    data: {
      supabaseId: authUser.id,
      name,
      phone,
      role: Role.TECHNICIAN,
      status: UserStatus.PENDING,
    },
  });

  if (claimed.count === 0) {
    try {
      await prisma.user.create({
        data: { supabaseId: authUser.id, email, name, phone },
      });
    } catch (err) {
      if (
        !(err instanceof Prisma.PrismaClientKnownRequestError) ||
        err.code !== "P2002"
      ) {
        throw err;
      }
    }
  }

  return prisma.user.findUnique({ where: { supabaseId: authUser.id } });
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const authUser = data.user;

  if (error || !authUser?.email || !authUser.email_confirmed_at) return null;

  const email = authUser.email.toLowerCase();
  const profile =
    (await prisma.user.findUnique({ where: { supabaseId: authUser.id } })) ??
    (await provisionProfile(authUser, email));

  if (!profile) return null;

  return {
    id: profile.id,
    supabaseId: authUser.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    status: profile.status,
  };
});

export async function requireApiUser(
  allowed: readonly AppRole[],
): Promise<GuardResult> {
  const user = await getCurrentUser();

  if (!user) return deny(401, "UNAUTHENTICATED", "Please sign in.");
  if (user.status !== "ACTIVE")
    return deny(403, "ACCOUNT_NOT_ACTIVE", "Your account is not active.");
  if (!allowed.includes(user.role)) {
    return deny(
      403,
      "FORBIDDEN",
      "You do not have permission for this action.",
    );
  }

  return { ok: true, user };
}

export async function mirrorToAuth(user: {
  supabaseId: string;
  role: AppRole;
  status: string;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.supabaseId, {
    app_metadata: { role: user.role, status: user.status },
  });

  if (error) throw new Error(error.message);
}
