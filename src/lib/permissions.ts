export type AppRole = "ADMIN" | "MANAGER" | "TECHNICIAN";
export type AppStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export interface SessionUser {
  name: string;
  email: string;
  role: AppRole;
}

export const APP_ROLES: readonly AppRole[] = ["ADMIN", "MANAGER", "TECHNICIAN"];
export const APP_STATUSES: readonly AppStatus[] = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
];
export const OFFICE_ROLES: readonly AppRole[] = ["ADMIN", "MANAGER"];
export const ADMIN_ROLES: readonly AppRole[] = ["ADMIN"];

export const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  TECHNICIAN: "Technician",
};

const ROUTE_RULES: ReadonlyArray<{
  prefix: string;
  roles: readonly AppRole[];
}> = [
  { prefix: "/admin", roles: ADMIN_ROLES },
  { prefix: "/inventory", roles: OFFICE_ROLES },

  { prefix: "/catalog", roles: OFFICE_ROLES },
  { prefix: "/sales", roles: OFFICE_ROLES },
  { prefix: "/purchasing", roles: OFFICE_ROLES },
  { prefix: "/transfers", roles: OFFICE_ROLES },
  { prefix: "/reports", roles: OFFICE_ROLES },
];

export function isRole(value: unknown): value is AppRole {
  return (
    typeof value === "string" &&
    (APP_ROLES as readonly string[]).includes(value)
  );
}

export function isStatus(value: unknown): value is AppStatus {
  return (
    typeof value === "string" &&
    (APP_STATUSES as readonly string[]).includes(value)
  );
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  const rule = ROUTE_RULES.find(
    (item) =>
      pathname === item.prefix || pathname.startsWith(`${item.prefix}/`),
  );
  return rule ? rule.roles.includes(role) : true;
}
