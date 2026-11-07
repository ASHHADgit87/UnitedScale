export type CertificateStatus =
  | "DRAFT"
  | "PENDING_INSPECTION"
  | "APPROVED_GOVT_SINDH"
  | "REJECTED"
  | "EXPIRED";

export const STATUS_LABELS: Record<CertificateStatus, string> = {
  DRAFT: "Draft",
  PENDING_INSPECTION: "Awaiting approval",
  APPROVED_GOVT_SINDH: "Approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export const TOLERANCE_NOTE =
  "Allowed error defaults to OIML R76 Class III (initial verification) and can be adjusted per test point.";

export interface PointInput {
  applied: number;
  indicated: number;
  mpe: number;
}

export interface LinearityPoint extends PointInput {
  error: number;
  pass: boolean;
}

export interface CertificateInput {
  clientName: string;
  clientAddress: string | null;
  clientContact: string | null;
  productId: string | null;
  equipmentModel: string;
  serialNumber: string;
  nominalCapacity: number;
  readability: number;
  calibrationDate: string;
  nextDueDate: string;
  environmentalTemp: number | null;
  environmentalHumidity: number | null;
  standardWeightUsed: string | null;
  notes: string | null;
  zeroError: number;
  repeatabilityMaxError: number;
  eccentricityMaxError: number;
  points: PointInput[];
}

export interface CalibrationResults {
  zeroError: number;
  repeatabilityMaxError: number;
  eccentricityMaxError: number;
  linearityPoints: LinearityPoint[];
  overall: "PASS" | "FAIL";
}

export type ParseResult =
  | { ok: true; data: CertificateInput }
  | { ok: false; message: string };

const MAX_POINTS = 20;

const round = (value: number, digits = 6) => Number(value.toFixed(digits));

const text = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const isBlank = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "");

const toNumber = (value: unknown): number | null => {
  const n =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

const isIsoDate = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());

function readOptional(
  value: unknown,
  min: number,
  max: number,
): { ok: true; value: number | null } | { ok: false } {
  if (isBlank(value)) return { ok: true, value: null };
  const n = toNumber(value);
  return n !== null && n >= min && n <= max
    ? { ok: true, value: n }
    : { ok: false };
}

const invalid = (message: string): ParseResult => ({ ok: false, message });

export function defaultMpe(applied: number, readability: number): number {
  if (!(readability > 0)) return 0;
  const divisions = applied / readability;
  const factor = divisions <= 500 ? 0.5 : divisions <= 2000 ? 1 : 1.5;
  return round(factor * readability);
}

export function evaluatePoints(points: PointInput[]): LinearityPoint[] {
  return points.map((point) => {
    const error = round(point.indicated - point.applied);
    return { ...point, error, pass: Math.abs(error) <= point.mpe + 1e-9 };
  });
}

export function buildResults(
  input: Pick<
    CertificateInput,
    "zeroError" | "repeatabilityMaxError" | "eccentricityMaxError" | "points"
  >,
): CalibrationResults {
  const linearityPoints = evaluatePoints(input.points);
  return {
    zeroError: input.zeroError,
    repeatabilityMaxError: input.repeatabilityMaxError,
    eccentricityMaxError: input.eccentricityMaxError,
    linearityPoints,
    overall:
      linearityPoints.length > 0 && linearityPoints.every((p) => p.pass)
        ? "PASS"
        : "FAIL",
  };
}

export function parseCertificateInput(body: unknown): ParseResult {
  if (!body || typeof body !== "object") return invalid("Invalid request.");
  const b = body as Record<string, unknown>;

  const clientName = text(b.clientName, 120);
  if (clientName.length < 2) return invalid("Enter the client name.");
  const equipmentModel = text(b.equipmentModel, 120);
  if (!equipmentModel) return invalid("Enter the instrument model.");
  const serialNumber = text(b.serialNumber, 80);
  if (!serialNumber) return invalid("Enter the serial number.");

  const nominalCapacity = toNumber(b.nominalCapacity);
  if (nominalCapacity === null || nominalCapacity <= 0) {
    return invalid("Enter a capacity greater than zero.");
  }
  const readability = toNumber(b.readability);
  if (
    readability === null ||
    readability <= 0 ||
    readability > nominalCapacity
  ) {
    return invalid(
      "Enter a readability that is above zero and not larger than the capacity.",
    );
  }

  if (!isIsoDate(b.calibrationDate) || !isIsoDate(b.nextDueDate)) {
    return invalid("Enter valid calibration and due dates.");
  }
  if (b.nextDueDate <= b.calibrationDate) {
    return invalid("The due date must be after the calibration date.");
  }

  const temperature = readOptional(b.environmentalTemp, -50, 100);
  if (!temperature.ok)
    return invalid("Temperature must be between -50 and 100 °C.");
  const humidity = readOptional(b.environmentalHumidity, 0, 100);
  if (!humidity.ok) return invalid("Humidity must be between 0 and 100 %.");

  const zero = readOptional(b.zeroError, -nominalCapacity, nominalCapacity);
  const repeatability = readOptional(
    b.repeatabilityMaxError,
    -nominalCapacity,
    nominalCapacity,
  );
  const eccentricity = readOptional(
    b.eccentricityMaxError,
    -nominalCapacity,
    nominalCapacity,
  );
  if (!zero.ok || !repeatability.ok || !eccentricity.ok) {
    return invalid(
      "Zero, repeatability and eccentricity errors must be valid numbers.",
    );
  }

  if (
    !Array.isArray(b.points) ||
    b.points.length < 1 ||
    b.points.length > MAX_POINTS
  ) {
    return invalid(`Add between 1 and ${MAX_POINTS} test points.`);
  }

  const points: PointInput[] = [];
  for (const raw of b.points) {
    if (!raw || typeof raw !== "object")
      return invalid("A test point is invalid.");
    const point = raw as Record<string, unknown>;
    const applied = toNumber(point.applied);
    const indicated = toNumber(point.indicated);
    const mpe = toNumber(point.mpe);
    if (applied === null || indicated === null || mpe === null) {
      return invalid(
        "Every test point needs an applied load, an indication and an allowed error.",
      );
    }
    if (
      applied < 0 ||
      applied > nominalCapacity * 1.1 ||
      indicated < 0 ||
      mpe < 0
    ) {
      return invalid("A test point has a value outside the valid range.");
    }
    points.push({ applied, indicated, mpe });
  }

  return {
    ok: true,
    data: {
      clientName,
      clientAddress: text(b.clientAddress, 200) || null,
      clientContact: text(b.clientContact, 120) || null,
      productId: isBlank(b.productId) ? null : text(b.productId, 64) || null,
      equipmentModel,
      serialNumber,
      nominalCapacity,
      readability,
      calibrationDate: b.calibrationDate,
      nextDueDate: b.nextDueDate,
      environmentalTemp: temperature.value,
      environmentalHumidity: humidity.value,
      standardWeightUsed: text(b.standardWeightUsed, 200) || null,
      notes: text(b.notes, 1000) || null,
      zeroError: zero.value ?? 0,
      repeatabilityMaxError: repeatability.value ?? 0,
      eccentricityMaxError: eccentricity.value ?? 0,
      points,
    },
  };
}

export function readResults(
  json: unknown,
  readability: number,
): CalibrationResults | null {
  if (!json || typeof json !== "object") return null;
  const record = json as Record<string, unknown>;
  const rawPoints = Array.isArray(record.linearityPoints)
    ? record.linearityPoints
    : [];

  const points: PointInput[] = rawPoints.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const point = raw as Record<string, unknown>;
    const applied = toNumber(point.applied);
    const indicated = toNumber(point.indicated);
    if (applied === null || indicated === null) return [];
    return [
      {
        applied,
        indicated,
        mpe: toNumber(point.mpe) ?? defaultMpe(applied, readability),
      },
    ];
  });

  return buildResults({
    zeroError: toNumber(record.zeroError) ?? 0,
    repeatabilityMaxError: toNumber(record.repeatabilityMaxError) ?? 0,
    eccentricityMaxError: toNumber(record.eccentricityMaxError) ?? 0,
    points,
  });
}

export function daysUntil(date: Date, now = new Date()): number {
  return Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
}

export function dueInfo(date: Date): {
  text: string;
  tone: "ok" | "soon" | "late";
} {
  const days = daysUntil(date);
  if (days < 0) return { text: `Overdue by ${-days} d`, tone: "late" };
  if (days <= 30) return { text: `Due in ${days} d`, tone: "soon" };
  return { text: `Valid for ${days} d`, tone: "ok" };
}

export function effectiveStatus(
  status: CertificateStatus,
  nextDueDate: Date,
  now = new Date(),
): CertificateStatus {
  return status === "APPROVED_GOVT_SINDH" &&
    nextDueDate.getTime() < now.getTime()
    ? "EXPIRED"
    : status;
}
