"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Notice, Panel } from "@/components/layout/PageKit";
import { formatDate, formatPkr, formatUnits } from "@/lib/format";
import type { StockLayer, StockLocation, StockProduct } from "@/lib/stock-data";

interface TransferFormProps {
  products: StockProduct[];
  locations: StockLocation[];
}

interface TransferResult {
  reference: string;
  quantity: number;
  value: number;
}

interface MoveStep {
  layer: StockLayer;
  take: number;
}

export default function TransferForm({
  products,
  locations,
}: TransferFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [fromId, setFromId] = useState(locations[0]?.id ?? "");
  const [toId, setToId] = useState(locations[1]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransferResult | null>(null);

  const product = products.find((item) => item.id === productId);
  const layers = product
    ? product.layers.filter((layer) => layer.warehouseId === fromId)
    : [];
  const available = layers.reduce((sum, layer) => sum + layer.remaining, 0);
  const qty = Number(quantity);
  const validQty = Number.isFinite(qty) && qty > 0;
  const sameLocation = fromId === toId;
  const unit = product?.unit ?? "PCS";

  let left = validQty ? qty : 0;
  let value = 0;
  const steps: MoveStep[] = [];
  for (const layer of layers) {
    if (left <= 0) break;
    const take = Math.min(layer.remaining, left);
    left -= take;
    value += take * layer.unitCost;
    steps.push({ layer, take });
  }
  const insufficient = validQty && left > 0;
  const blocked = !validQty || insufficient || sameLocation || !toId;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (blocked || submitting) return;

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/fifo/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          fromWarehouseId: fromId,
          toWarehouseId: toId,
          quantity: qty,
          notes: notes.trim() || undefined,
        }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        setError(json?.message ?? "The transfer could not be completed.");
        return;
      }

      setResult({
        reference: json.data.transferReference,
        quantity: qty,
        value: Number(json.data.totalValuationTransferred),
      });
      setQuantity("1");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (products.length === 0 || locations.length < 2) {
    return (
      <Notice tone="info">
        You need at least two locations and one product to transfer stock.
      </Notice>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Panel
        title="Transfer details"
        subtitle="Choose the product, the route and the quantity."
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap gap-4">
            <Field label="Product">
              <Select
                value={productId}
                onChange={(event) => {
                  setProductId(event.target.value);
                  setError(null);
                  setResult(null);
                }}
              >
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={`Quantity (${unit})`}
              hint={`${formatUnits(available)} ${unit} available at the source`}
            >
              <Input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-4">
            <Field label="From">
              <Select
                value={fromId}
                onChange={(event) => setFromId(event.target.value)}
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="To">
              <Select
                value={toId}
                onChange={(event) => setToId(event.target.value)}
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Gate pass or note (optional)">
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
              Batches that will move
            </span>
            {sameLocation ? (
              <Notice tone="error">Choose two different locations.</Notice>
            ) : !validQty ? (
              <span className="text-xs text-zinc-500">
                Enter a quantity to preview the batches.
              </span>
            ) : insufficient ? (
              <Notice tone="error">
                Only {formatUnits(available)} {unit} are available at the source
                location.
              </Notice>
            ) : (
              <>
                {steps.map((step) => (
                  <div
                    key={step.layer.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-white">
                        {step.layer.batchNumber ?? "Batch"}
                      </span>
                      <span className="text-zinc-500">
                        Received {formatDate(new Date(step.layer.fifoDate))} ·{" "}
                        {formatUnits(step.take)} {unit} at{" "}
                        {formatPkr(step.layer.unitCost)}
                      </span>
                    </div>
                    <span className="font-semibold tabular-nums text-white">
                      {formatPkr(step.take * step.layer.unitCost)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-zinc-400">
                    Value moved (cost preserved)
                  </span>
                  <span className="font-semibold tabular-nums text-white">
                    {formatPkr(value)}
                  </span>
                </div>
              </>
            )}
          </div>

          {error && <Notice tone="error">{error}</Notice>}

          <Button type="submit" size="lg" disabled={submitting || blocked}>
            <Send className="h-4 w-4" />
            {submitting ? "Transferring..." : "Transfer stock"}
          </Button>
        </div>
      </Panel>

      {result && (
        <Notice tone="success">
          Transferred {formatUnits(result.quantity)} {unit}, valued at{" "}
          {formatPkr(result.value)}. Reference {result.reference}.
        </Notice>
      )}
    </form>
  );
}
