import { CertStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildResults, type CertificateInput } from "@/lib/calibration";

export function certificateFields(input: CertificateInput) {
  return {
    clientName: input.clientName,
    clientAddress: input.clientAddress,
    clientContact: input.clientContact,
    productId: input.productId,
    equipmentModel: input.equipmentModel,
    serialNumber: input.serialNumber,
    nominalCapacity: input.nominalCapacity,
    readability: input.readability,
    calibrationDate: new Date(`${input.calibrationDate}T00:00:00.000Z`),
    nextDueDate: new Date(`${input.nextDueDate}T00:00:00.000Z`),
    environmentalTemp: input.environmentalTemp,
    environmentalHumidity: input.environmentalHumidity,
    standardWeightUsed: input.standardWeightUsed,
    notes: input.notes,
    calibrationResults: buildResults(input) as unknown as Prisma.InputJsonValue,
  };
}

export async function createCertificate(
  input: CertificateInput,
  inspectorId: string,
  submit: boolean,
): Promise<{ id: string; certificateNumber: string }> {
  const prefix = `US-CAL-${new Date().getUTCFullYear()}-`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const last = await prisma.calibrationCertificate.findFirst({
      where: { certificateNumber: { startsWith: prefix } },
      orderBy: { certificateNumber: "desc" },
      select: { certificateNumber: true },
    });
    const parsed = last
      ? Number(last.certificateNumber.slice(prefix.length))
      : 0;
    const sequence = Number.isFinite(parsed) ? parsed + 1 : 1;
    const certificateNumber = `${prefix}${String(sequence).padStart(4, "0")}`;

    try {
      return await prisma.calibrationCertificate.create({
        data: {
          ...certificateFields(input),
          certificateNumber,
          inspectorTechnicianId: inspectorId,
          status: submit ? CertStatus.PENDING_INSPECTION : CertStatus.DRAFT,
        },
        select: { id: true, certificateNumber: true },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      )
        continue;
      throw err;
    }
  }

  throw new Error("Could not allocate a certificate number.");
}
