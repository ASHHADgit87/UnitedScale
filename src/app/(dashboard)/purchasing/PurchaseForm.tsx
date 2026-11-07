"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Notice, Panel } from "@/components/layout/PageKit";
import { formatPkr, formatUnits } from "@/lib/format";

interface PurchaseFormProps {
  products: { id: string; sku: string; name: string; unit: string }[];
  locations: { id: string; name: string }[];
  canBackdate: boolean;
}

interface ReceiptResult {
  batch: string;
  reference: string;
  quantity: number;
  value: number;
}

const ENTRY_TYPES = [
  { value: "PURCHASE", label: "Purchase" },
  { value: "OPENING_STOCK", label: "Opening stock" },
  { value: "ADJUSTMENT", label: "Stock adjustment (increase)" },
] as const;

export default function PurchaseForm({
  products,
  locations,
  canBackdate,
}: PurchaseFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [entryType, setEntryType] =
    useState<(typeof ENTRY_TYPES)[number]["value"]>("PURCHASE");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [reference, setReference] = useState("");
  const [supplier, setSupplier] = useState("");
  const [receivedOn, setReceivedOn] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReceiptResult | null>(null);

  const product = products.find((item) => item.id === productId);
  const qty = Number(quantity);
  const cost = Number(unitCost);
  const validQty = quantity.trim() !== "" && Number.isFinite(qty) && qty > 0;
  const validCost =
    unitCost.trim() !== "" && Number.isFinite(cost) && cost >= 0;
  const total = validQty && validCost ? qty * cost : 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validQty || !validCost || submitting) return;

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/fifo/add-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          warehouseId: locationId,
          quantity: qty,
          unitCost: cost,
          batchNumber: batchNumber.trim() || undefined,
          source: entryType,
          sourceReference: reference.trim() || undefined,
          notes: supplier.trim() ? `Supplier: ${supplier.trim()}` : undefined,
          fifoDate: canBackdate && receivedOn ? receivedOn : undefined,
        }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        setError(json?.message ?? "The stock could not be received.");
        return;
      }

      setResult({
        batch: json.data.layer.batchNumber ?? "Batch",
        reference: json.data.movement.reference,
        quantity: qty,
        value: total,
      });
      setQuantity("");
      setBatchNumber("");
      setReference("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (products.length === 0 || locations.length === 0) {
    return (
      <Notice tone="info">
        Add at least one product and one location before receiving stock.
      </Notice>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Panel
        title="Receipt details"
        subtitle="What arrived, where it is stored and what it cost."
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap gap-4">
            <Field label="Product">
              <Select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
              >
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Receiving location">
              <Select
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-4">
            <Field label="Entry type">
              <Select
                value={entryType}
                onChange={(event) =>
                  setEntryType(
                    event.target.value as (typeof ENTRY_TYPES)[number]["value"],
                  )
                }
              >
                {ENTRY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={`Quantity (${product?.unit ?? "PCS"})`}>
              <Input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Unit cost (PKR)">
              <Input
                type="number"
                min="0"
                step="any"
                value={unitCost}
                onChange={(event) => setUnitCost(event.target.value)}
                placeholder="0"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-4">
            <Field label="Purchase order / reference" hint="Optional">
              <Input
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="e.g. PO-2026-NOV-501"
              />
            </Field>
            <Field
              label="Batch number"
              hint="Leave empty to generate one automatically"
            >
              <Input
                value={batchNumber}
                onChange={(event) => setBatchNumber(event.target.value)}
                placeholder="e.g. LOT-2026-NOV-01"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-4">
            <Field label="Supplier" hint="Optional">
              <Textarea
                value={supplier}
                onChange={(event) => setSupplier(event.target.value)}
                className="min-h-[44px]"
              />
            </Field>
            {canBackdate && (
              <Field
                label="Received on"
                hint="Administrators only. Leave empty for today."
              >
                <Input
                  type="date"
                  value={receivedOn}
                  onChange={(event) => setReceivedOn(event.target.value)}
                />
              </Field>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3">
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Receipt value
            </span>
            <span className="text-lg font-semibold tabular-nums text-white">
              {formatPkr(total)}
            </span>
          </div>

          {error && <Notice tone="error">{error}</Notice>}

          <Button
            type="submit"
            size="lg"
            disabled={submitting || !validQty || !validCost}
          >
            <PackagePlus className="h-4 w-4" />
            {submitting ? "Receiving stock..." : "Receive stock"}
          </Button>
        </div>
      </Panel>

      {result && (
        <Notice tone="success">
          Received {formatUnits(result.quantity)} {product?.unit ?? "PCS"} as{" "}
          {result.batch}, valued at {formatPkr(result.value)}. Reference{" "}
          {result.reference}.
        </Notice>
      )}
    </form>
  );
}
