import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { InsufficientStockError } from "@/lib/fifo-engine";

export function fail(status: number, error: string, message: string) {
  return NextResponse.json({ success: false, error, message }, { status });
}

export function isId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 64;
}

export function parseQuantity(value: unknown): number | null {
  const n =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n > 0 && n <= 1_000_000
    ? n
    : null;
}

export function parseCost(value: unknown): number | null {
  const n =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof n === "number" &&
    Number.isFinite(n) &&
    n >= 0 &&
    n <= 100_000_000
    ? n
    : null;
}

export function clip(value: unknown, max = 500): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export function handleApiError(err: unknown, context: string) {
  if (err instanceof InsufficientStockError) {
    return NextResponse.json(
      {
        success: false,
        error: "INSUFFICIENT_STOCK",
        message: err.message,
        requestedQty: err.requestedQty,
        availableQty: err.availableQty,
      },
      { status: 400 },
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2003")
      return fail(400, "INVALID_REFERENCE", "Unknown product or warehouse.");
    if (err.code === "P2034") {
      return fail(
        409,
        "CONFLICT",
        "Another update is in progress. Please try again.",
      );
    }
  }

  console.error(`${context} failed:`, err);
  return fail(
    500,
    "INTERNAL_SERVER_ERROR",
    "Something went wrong. Please try again.",
  );
}
