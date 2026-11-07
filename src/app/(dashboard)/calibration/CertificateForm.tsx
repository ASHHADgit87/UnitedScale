"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Notice, Panel } from "@/components/layout/PageKit";
import {
  TOLERANCE_NOTE,
  defaultMpe,
  evaluatePoints,
  parseCertificateInput,
} from "@/lib/calibration";

export interface CertificateFields {
  clientName: string;
  clientAddress: string;
  clientContact: string;
  productId: string;
  equipmentModel: string;
  serialNumber: string;
  nominalCapacity: string;
  readability: string;
  calibrationDate: string;
  nextDueDate: string;
  environmentalTemp: string;
  environmentalHumidity: string;
  standardWeightUsed: string;
  notes: string;
  zeroError: string;
  repeatabilityMaxError: string;
  eccentricityMaxError: string;
}

export interface PointValues {
  applied: string;
  indicated: string;
  mpe: string;
  custom: boolean;
}

export interface CertificateFormValues extends CertificateFields {
  points: PointValues[];
}

interface Row extends PointValues {
  id: number;
}

interface CertificateFormProps {
  mode: "create" | "edit";
  certificateId?: string;
  products: { id: string; name: string; sku: string }[];
  initial?: CertificateFormValues;
}

const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });

const oneYearAfter = (date: string) => {
  const next = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(next.getTime())) return "";
  next.setUTCFullYear(next.getUTCFullYear() + 1);
  next.setUTCDate(next.getUTCDate() - 1);
  return next.toISOString().slice(0, 10);
};

const emptyFields = (): CertificateFields => {
  const date = today();
  return {
    clientName: "",
    clientAddress: "",
    clientContact: "",
    productId: "",
    equipmentModel: "",
    serialNumber: "",
    nominalCapacity: "",
    readability: "",
    calibrationDate: date,
    nextDueDate: oneYearAfter(date),
    environmentalTemp: "",
    environmentalHumidity: "",
    standardWeightUsed: "",
    notes: "",
    zeroError: "0",
    repeatabilityMaxError: "0",
    eccentricityMaxError: "0",
  };
};

export default function CertificateForm({
  mode,
  certificateId,
  products,
  initial,
}: CertificateFormProps) {
  const router = useRouter();
  const { points: initialPoints, ...initialFields } = initial ?? {
    ...emptyFields(),
    points: [],
  };

  const [values, setValues] = useState<CertificateFields>(initialFields);
  const [dueTouched, setDueTouched] = useState(mode === "edit");
  const nextRowId = useRef(Math.max(initialPoints.length, 1));
  const [rows, setRows] = useState<Row[]>(
    initialPoints.length > 0
      ? initialPoints.map((point, index) => ({ id: index, ...point }))
      : [{ id: 0, applied: "", indicated: "", mpe: "", custom: false }],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof CertificateFields, value: string) =>
    setValues((previous) => ({ ...previous, [key]: value }));

  const capacity = Number(values.nominalCapacity);
  const readability = Number(values.readability);

  const effectiveMpe = (row: Row): string => {
    if (row.custom) return row.mpe;
    const applied = Number(row.applied);
    if (
      row.applied.trim() === "" ||
      !Number.isFinite(applied) ||
      !(readability > 0)
    )
      return "";
    return String(defaultMpe(applied, readability));
  };

  const updateRow = (id: number, patch: Partial<Row>) =>
    setRows((previous) =>
      previous.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );

  const addRow = () =>
    setRows((previous) => [
      ...previous,
      {
        id: nextRowId.current++,
        applied: "",
        indicated: "",
        mpe: "",
        custom: false,
      },
    ]);

  const addStandardPoints = () => {
    if (!(capacity > 0)) {
      setError(
        "Enter the capacity first so the standard test points can be filled in.",
      );
      return;
    }
    setError(null);
    setRows(
      [0.25, 0.5, 0.75, 1].map((fraction) => ({
        id: nextRowId.current++,
        applied: String(Number((capacity * fraction).toFixed(3))),
        indicated: "",
        mpe: "",
        custom: false,
      })),
    );
  };

  const computed = rows.map((row) => {
    const applied = Number(row.applied);
    const indicated = Number(row.indicated);
    const mpe = Number(effectiveMpe(row));
    const complete =
      row.applied.trim() !== "" &&
      row.indicated.trim() !== "" &&
      effectiveMpe(row).trim() !== "" &&
      [applied, indicated, mpe].every(Number.isFinite);
    return {
      row,
      complete,
      point: complete ? evaluatePoints([{ applied, indicated, mpe }])[0] : null,
    };
  });

  const allComplete =
    computed.length > 0 && computed.every((item) => item.complete);
  const overall = allComplete
    ? computed.every((item) => item.point?.pass)
      ? "PASS"
      : "FAIL"
    : null;

  const submit = async (submitForApproval: boolean) => {
    setError(null);

    const payload = {
      ...values,
      productId: values.productId || null,
      points: rows.map((row) => ({
        applied: row.applied,
        indicated: row.indicated,
        mpe: effectiveMpe(row),
      })),
    };

    const parsed = parseCertificateInput(payload);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        mode === "create"
          ? "/api/calibration"
          : `/api/calibration/${certificateId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "create"
              ? { ...payload, submit: submitForApproval }
              : { ...payload, action: "update", submit: submitForApproval },
          ),
        },
      );
      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        setError(json?.message ?? "The certificate could not be saved.");
        return;
      }

      router.push(
        `/calibration/${mode === "create" ? json.data.id : certificateId}`,
      );
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Panel title="Client" subtitle="Who the instrument belongs to.">
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap gap-4">
            <Field label="Client name">
              <Input
                value={values.clientName}
                onChange={(event) => set("clientName", event.target.value)}
              />
            </Field>
            <Field label="Contact person and phone">
              <Input
                value={values.clientContact}
                onChange={(event) => set("clientContact", event.target.value)}
              />
            </Field>
          </div>
          <Field label="Address">
            <Input
              value={values.clientAddress}
              onChange={(event) => set("clientAddress", event.target.value)}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Instrument" subtitle="What was calibrated.">
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap gap-4">
            <Field label="Model">
              <Input
                value={values.equipmentModel}
                onChange={(event) => set("equipmentModel", event.target.value)}
                placeholder="e.g. 500×600 Platform Scale + D-900s"
              />
            </Field>
            <Field label="Serial number">
              <Input
                value={values.serialNumber}
                onChange={(event) => set("serialNumber", event.target.value)}
              />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4">
            <Field label="Catalogue product (optional)">
              <Select
                value={values.productId}
                onChange={(event) => set("productId", event.target.value)}
              >
                <option value="">Not linked</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Capacity (kg)">
              <Input
                type="number"
                min="0"
                step="any"
                value={values.nominalCapacity}
                onChange={(event) => set("nominalCapacity", event.target.value)}
              />
            </Field>
            <Field label="Readability (kg)">
              <Input
                type="number"
                min="0"
                step="any"
                value={values.readability}
                onChange={(event) => set("readability", event.target.value)}
              />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel
        title="Conditions and standards"
        subtitle="When and how the calibration was done."
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap gap-4">
            <Field label="Calibration date">
              <Input
                type="date"
                value={values.calibrationDate}
                onChange={(event) => {
                  set("calibrationDate", event.target.value);
                  if (!dueTouched)
                    set("nextDueDate", oneYearAfter(event.target.value));
                }}
              />
            </Field>
            <Field label="Valid until">
              <Input
                type="date"
                value={values.nextDueDate}
                onChange={(event) => {
                  setDueTouched(true);
                  set("nextDueDate", event.target.value);
                }}
              />
            </Field>
            <Field label="Temperature (°C)">
              <Input
                type="number"
                step="any"
                value={values.environmentalTemp}
                onChange={(event) =>
                  set("environmentalTemp", event.target.value)
                }
              />
            </Field>
            <Field label="Humidity (%)">
              <Input
                type="number"
                step="any"
                value={values.environmentalHumidity}
                onChange={(event) =>
                  set("environmentalHumidity", event.target.value)
                }
              />
            </Field>
          </div>
          <Field label="Standard weights used">
            <Input
              value={values.standardWeightUsed}
              onChange={(event) =>
                set("standardWeightUsed", event.target.value)
              }
              placeholder="e.g. Class M1 stainless steel standards"
            />
          </Field>
          <div className="flex flex-wrap gap-4">
            <Field label="Zero error (kg)">
              <Input
                type="number"
                step="any"
                value={values.zeroError}
                onChange={(event) => set("zeroError", event.target.value)}
              />
            </Field>
            <Field label="Repeatability, max error (kg)">
              <Input
                type="number"
                step="any"
                value={values.repeatabilityMaxError}
                onChange={(event) =>
                  set("repeatabilityMaxError", event.target.value)
                }
              />
            </Field>
            <Field label="Eccentricity, max error (kg)">
              <Input
                type="number"
                step="any"
                value={values.eccentricityMaxError}
                onChange={(event) =>
                  set("eccentricityMaxError", event.target.value)
                }
              />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel
        title="Linearity test"
        subtitle="Applied load against the indication. Errors and results are calculated for you."
        action={
          overall ? (
            <Badge variant={overall === "PASS" ? "success" : "destructive"}>
              {overall}
            </Badge>
          ) : (
            <Badge variant="secondary">Incomplete</Badge>
          )
        }
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  <th className="pb-2 pr-3 font-medium">Applied (kg)</th>
                  <th className="pb-2 pr-3 font-medium">Indicated (kg)</th>
                  <th className="pb-2 pr-3 font-medium">Error (kg)</th>
                  <th className="pb-2 pr-3 font-medium">Allowed ± (kg)</th>
                  <th className="pb-2 pr-3 font-medium">Result</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {computed.map(({ row, point }) => (
                  <tr key={row.id}>
                    <td className="pb-2 pr-3">
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        className="h-10"
                        value={row.applied}
                        onChange={(event) =>
                          updateRow(row.id, { applied: event.target.value })
                        }
                      />
                    </td>
                    <td className="pb-2 pr-3">
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        className="h-10"
                        value={row.indicated}
                        onChange={(event) =>
                          updateRow(row.id, { indicated: event.target.value })
                        }
                      />
                    </td>
                    <td className="pb-2 pr-3 tabular-nums text-zinc-300">
                      {point
                        ? `${point.error > 0 ? "+" : ""}${point.error}`
                        : "—"}
                    </td>
                    <td className="pb-2 pr-3">
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        className="h-10"
                        value={effectiveMpe(row)}
                        onChange={(event) =>
                          updateRow(row.id, {
                            mpe: event.target.value,
                            custom: true,
                          })
                        }
                      />
                    </td>
                    <td className="pb-2 pr-3">
                      {point ? (
                        <Badge variant={point.pass ? "success" : "destructive"}>
                          {point.pass ? "Pass" : "Fail"}
                        </Badge>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="pb-2 text-right">
                      <button
                        type="button"
                        aria-label="Remove test point"
                        disabled={rows.length === 1}
                        onClick={() =>
                          setRows((previous) =>
                            previous.filter((item) => item.id !== row.id),
                          )
                        }
                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={rows.length >= 20}
            >
              <Plus className="h-4 w-4" />
              Add test point
            </Button>
            <Button variant="ghost" size="sm" onClick={addStandardPoints}>
              Fill standard points (25 / 50 / 75 / 100 %)
            </Button>
          </div>
          <p className="text-[11px] text-zinc-500">{TOLERANCE_NOTE}</p>
        </div>
      </Panel>

      <Panel title="Notes">
        <div className="p-5">
          <Field label="Remarks (optional)">
            <Textarea
              value={values.notes}
              onChange={(event) => set("notes", event.target.value)}
            />
          </Field>
        </div>
      </Panel>

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="outline" size="lg" disabled={submitting}>
          {submitting
            ? "Saving..."
            : mode === "create"
              ? "Save draft"
              : "Save changes"}
        </Button>
        <Button
          size="lg"
          disabled={submitting}
          onClick={() => void submit(true)}
        >
          Save and submit for approval
        </Button>
      </div>
    </form>
  );
}
