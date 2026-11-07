"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Notice, Panel } from "@/components/layout/PageKit";
import { formatDate, formatPkr, formatUnits } from "@/lib/format";
import type { StockLayer, StockLocation, StockProduct } from "@/lib/stock-data";

interface SalesFormProps {
  products: StockProduct[];
  locations: StockLocation[];
}

interface SaleResult {
  product: string;
  quantity: number;
  cost: number;
  average: number;
  steps: {
    batch: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
  }[];
}

interface DrainStep {
  layer: StockLayer;
  take: number;
  subtotal: number;
  after: number;
}

export default function SalesForm({ products, locations }: SalesFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState(
    String(products[0]?.sellingPrice ?? 0),
  );
  const [client, setClient] = useState("");
  const [invoice, setInvoice] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SaleResult | null>(null);

  const product = products.find((item) => item.id === productId);
  const layers = product
    ? product.layers.filter((layer) => layer.warehouseId === locationId)
    : [];
  const available = layers.reduce((sum, layer) => sum + layer.remaining, 0);
  const qty = Number(quantity);
  const validQty = Number.isFinite(qty) && qty > 0;
  const price = Number(unitPrice);
  const validPrice = Number.isFinite(price) && price >= 0;

  let left = validQty ? qty : 0;
  let cost = 0;
  const steps: DrainStep[] = [];
  for (const layer of layers) {
    if (left <= 0) break;
    const take = Math.min(layer.remaining, left);
    left -= take;
    cost += take * layer.unitCost;
    steps.push({
      layer,
      take,
      subtotal: take * layer.unitCost,
      after: layer.remaining - take,
    });
  }

  const insufficient = validQty && left > 0;
  const revenue = validQty && validPrice ? qty * price : 0;
  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const unit = product?.unit ?? "PCS";

  const handleProductChange = (id: string) => {
    setProductId(id);
    setUnitPrice(
      String(products.find((item) => item.id === id)?.sellingPrice ?? 0),
    );
    setError(null);
    setResult(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product || !validQty || insufficient || submitting) return;

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const reason = `Sale${invoice.trim() ? ` ${invoice.trim()}` : ""}${client.trim() ? ` · ${client.trim()}` : ""}`;
      const noteParts = [
        validPrice ? `Unit price PKR ${price}` : "",
        notes.trim(),
      ].filter(Boolean);

      const response = await fetch("/api/fifo/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          warehouseId: locationId,
          quantity: qty,
          reason,
          notes: noteParts.join(" | "),
        }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        setError(json?.message ?? "The sale could not be recorded.");
        return;
      }

      const data = json.data as {
        totalCostOfGoodsSold: string;
        averageUnitCost: string;
        deductions: {
          batchNumber: string | null;
          deductedQty: string;
          unitCost: string;
          subtotalCost: string;
        }[];
      };

      setResult({
        product: product.name,
        quantity: qty,
        cost: Number(data.totalCostOfGoodsSold),
        average: Number(data.averageUnitCost),
        steps: data.deductions.map((step) => ({
          batch: step.batchNumber ?? "Batch",
          quantity: Number(step.deductedQty),
          unitCost: Number(step.unitCost),
          subtotal: Number(step.subtotalCost),
        })),
      });
      setQuantity("1");
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
        Add at least one product and one location before recording sales.
      </Notice>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 xl:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <Panel
          title="Sale details"
          subtitle="Choose what was sold and where it was dispatched from."
        >
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap gap-4">
              <Field label="Product">
                <Select
                  value={productId}
                  onChange={(event) => handleProductChange(event.target.value)}
                >
                  {products.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Dispatch from">
                <Select
                  value={locationId}
                  onChange={(event) => {
                    setLocationId(event.target.value);
                    setError(null);
                    setResult(null);
                  }}
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
              <Field
                label={`Quantity (${unit})`}
                hint={`${formatUnits(available)} ${unit} available here`}
              >
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </Field>
              <Field label="Unit price (PKR)">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(event.target.value)}
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-4">
              <Field label="Customer">
                <Input
                  value={client}
                  onChange={(event) => setClient(event.target.value)}
                  placeholder="e.g. Lucky Cement Ltd"
                />
              </Field>
              <Field label="Invoice number">
                <Input
                  value={invoice}
                  onChange={(event) => setInvoice(event.target.value)}
                  placeholder="e.g. INV-2026-1105"
                />
              </Field>
            </div>

            <Field label="Notes (optional)">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>

            <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                Batches that will be used
              </span>
              {!validQty ? (
                <span className="text-xs text-zinc-500">
                  Enter a quantity to preview the batches.
                </span>
              ) : insufficient ? (
                <Notice tone="error">
                  Only {formatUnits(available)} {unit} are available at this
                  location. Reduce the quantity or choose another location.
                </Notice>
              ) : (
                steps.map((step) => (
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
                        {formatPkr(step.layer.unitCost)} ·{" "}
                        {formatUnits(step.after)} left
                      </span>
                    </div>
                    <span className="font-semibold tabular-nums text-white">
                      {formatPkr(step.subtotal)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {error && <Notice tone="error">{error}</Notice>}

            <Button
              type="submit"
              size="lg"
              disabled={submitting || !validQty || insufficient}
            >
              <ShoppingCart className="h-4 w-4" />
              {submitting ? "Recording sale..." : "Record sale"}
            </Button>
          </div>
        </Panel>

        {result && (
          <Panel
            title="Sale recorded"
            subtitle={`${formatUnits(result.quantity)} × ${result.product}`}
          >
            <div className="flex flex-col gap-3 p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Cost of goods</span>
                <span className="font-semibold tabular-nums text-white">
                  {formatPkr(result.cost)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Average cost per unit</span>
                <span className="tabular-nums text-white">
                  {formatPkr(result.average)}
                </span>
              </div>
              {result.steps.map((step) => (
                <div
                  key={`${step.batch}-${step.unitCost}`}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-zinc-500">
                    {step.batch}: {formatUnits(step.quantity)} at{" "}
                    {formatPkr(step.unitCost)}
                  </span>
                  <span className="tabular-nums text-zinc-300">
                    {formatPkr(step.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      <div className="flex w-full flex-none flex-col gap-6 xl:w-[380px]">
        <Panel title="Order summary" subtitle="Updates as you type.">
          <div className="flex flex-col gap-3 p-5 text-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400">Revenue</span>
              <span className="tabular-nums text-white">
                {formatPkr(revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-400">Cost of goods</span>
              <span className="tabular-nums text-red-300">
                {formatPkr(insufficient ? 0 : cost)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  Gross profit
                </span>
                <span className="text-xl font-semibold tabular-nums text-white">
                  {formatPkr(insufficient ? 0 : profit)}
                </span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-red-300">
                {insufficient ? "0.0" : margin.toFixed(1)}%
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </form>
  );
}
