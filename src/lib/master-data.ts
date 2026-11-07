import { Prisma, Role, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clip, fail, handleApiError, isId, parseCost } from "@/lib/api-utils";

export type Parsed<T> = { ok: true; data: T } | { ok: false; message: string };

const bad = (message: string): { ok: false; message: string } => ({
  ok: false,
  message,
});

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]*$/;

const code = (value: unknown, max: number): string | null => {
  const text = clip(value, max + 1)?.toUpperCase();
  return text &&
    text.length >= 2 &&
    text.length <= max &&
    CODE_PATTERN.test(text)
    ? text
    : null;
};

export async function readBody(
  req: Request,
): Promise<Record<string, unknown> | null> {
  const body: unknown = await req.json().catch(() => null);
  return typeof body === "object" && body !== null && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : null;
}

export interface CategoryInput {
  name: string;
  code: string;
  description: string | null;
}

export function readCategory(
  body: Record<string, unknown> | null,
): Parsed<CategoryInput> {
  if (!body) return bad("Invalid request body.");

  const name = clip(body.name, 80);
  if (!name) return bad("Category name is required.");

  const categoryCode = code(body.code, 16);
  if (!categoryCode) {
    return bad(
      "Code is required: 2-16 letters, numbers, dots, dashes or underscores.",
    );
  }

  return {
    ok: true,
    data: {
      name,
      code: categoryCode,
      description: clip(body.description, 300) ?? null,
    },
  };
}

export interface ProductInput {
  sku: string;
  name: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  capacity: string | null;
  resolution: string | null;
  unit: string;
  hasSerialPort: boolean;
  rs232Protocol: string | null;
  minStockLevel: number;
  sellingPrice: number;
  categoryId: string;
}

export function readProduct(
  body: Record<string, unknown> | null,
): Parsed<ProductInput> {
  if (!body) return bad("Invalid request body.");

  const sku = code(body.sku, 40);
  if (!sku) {
    return bad(
      "SKU is required: 2-40 letters, numbers, dots, dashes or underscores.",
    );
  }

  const name = clip(body.name, 120);
  if (!name) return bad("Product name is required.");

  if (!isId(body.categoryId)) return bad("Choose a category.");

  const unit = clip(body.unit, 13)?.toUpperCase() ?? "PCS";
  if (unit.length > 12) return bad("Unit must be 12 characters or fewer.");

  const minStockLevel = parseCost(body.minStockLevel ?? 0);
  if (minStockLevel === null) return bad("Minimum stock must be zero or more.");

  const sellingPrice = parseCost(body.sellingPrice ?? 0);
  if (sellingPrice === null) return bad("Selling price must be zero or more.");

  const hasSerialPort = body.hasSerialPort === true;

  return {
    ok: true,
    data: {
      sku,
      name,
      description: clip(body.description, 500) ?? null,
      brand: clip(body.brand, 60) ?? null,
      model: clip(body.model, 60) ?? null,
      capacity: clip(body.capacity, 60) ?? null,
      resolution: clip(body.resolution, 60) ?? null,
      unit,
      hasSerialPort,

      rs232Protocol: hasSerialPort
        ? (clip(body.rs232Protocol, 120) ?? null)
        : null,
      minStockLevel,
      sellingPrice,
      categoryId: body.categoryId,
    },
  };
}

export interface WarehouseInput {
  name: string;
  code: string;
  location: string;
  city: string;
  isHeadquarters: boolean;
  managerId: string | null;
}

export function readWarehouse(
  body: Record<string, unknown> | null,
): Parsed<WarehouseInput> {
  if (!body) return bad("Invalid request body.");

  const name = clip(body.name, 80);
  if (!name) return bad("Location name is required.");

  const warehouseCode = code(body.code, 24);
  if (!warehouseCode) {
    return bad(
      "Code is required: 2-24 letters, numbers, dots, dashes or underscores.",
    );
  }

  const location = clip(body.location, 200);
  if (!location) return bad("Address is required.");

  const rawManager = body.managerId;
  const noManager =
    rawManager === undefined || rawManager === null || rawManager === "";
  if (!noManager && !isId(rawManager)) return bad("Invalid manager.");

  return {
    ok: true,
    data: {
      name,
      code: warehouseCode,
      location,
      city: clip(body.city, 60) ?? "Karachi",
      isHeadquarters: body.isHeadquarters === true,
      managerId: noManager ? null : (rawManager as string),
    },
  };
}

export async function managerExists(id: string): Promise<boolean> {
  const found = await prisma.user.findFirst({
    where: {
      id,
      status: UserStatus.ACTIVE,
      role: { in: [Role.ADMIN, Role.MANAGER] },
    },
    select: { id: true },
  });
  return found !== null;
}

export function handleMasterError(err: unknown, context: string) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return fail(409, "DUPLICATE", "That name, code or SKU already exists.");
    }
    if (err.code === "P2025") {
      return fail(404, "NOT_FOUND", "That record no longer exists.");
    }
    if (err.code === "P2003") {
      return fail(
        409,
        "IN_USE",
        "This record is linked to other data, so the change was blocked.",
      );
    }
  }
  return handleApiError(err, context);
}
