import "dotenv/config";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PrismaClient, Role, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function findAuthUser(admin: SupabaseClient, email: string) {
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email,
    );
    if (match) return match;
    if (data.users.length < 200) return null;

    page += 1;
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.ADMIN_NAME?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.",
    );
  }
  if (!email || !name || !password) {
    throw new Error(
      "Set ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD before running this script.",
    );
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const appMetadata = { role: Role.ADMIN, status: UserStatus.ACTIVE };
  const existing = await findAuthUser(admin, email);

  const result = existing
    ? await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        app_metadata: appMetadata,
        user_metadata: { name },
      })
    : await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: appMetadata,
        user_metadata: { name },
      });

  if (result.error || !result.data.user) {
    throw result.error ?? new Error("Could not create the admin account.");
  }

  const supabaseId = result.data.user.id;

  await prisma.user.upsert({
    where: { email },
    update: { supabaseId, name, role: Role.ADMIN, status: UserStatus.ACTIVE },
    create: {
      supabaseId,
      email,
      name,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`Admin ready: ${email}`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
