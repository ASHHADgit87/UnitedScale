"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { EmptyState, Notice, Panel } from "@/components/layout/PageKit";
import { formatPkr, formatUnits } from "@/lib/format";
import { sendJson } from "@/lib/master-client";

export interface ProductRow {
  id: string;
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
  categoryName: string;
}

interface ProductManagerProps {
  products: ProductRow[];
  categories: { id: string; name: string }[];
  canDelete: boolean;
}

interface FormState {
  sku: string;
  name: string;
  categoryId: string;
  brand: string;
  model: string;
  capacity: string;
  resolution: string;
  unit: string;
  hasSerialPort: boolean;
  rs232Protocol: string;
  minStockLevel: string;
  sellingPrice: string;
  description: string;
}

const blankForm = (categoryId: string): FormState => ({
  sku: "",
  name: "",
  categoryId,
  brand: "",
  model: "",
  capacity: "",
  resolution: "",
  unit: "PCS",
  hasSerialPort: false,
  rs232Protocol: "",
  minStockLevel: "5",
  sellingPrice: "0",
  description: "",
});

export default function ProductManager({
  products,
  categories,
  canDelete,
}: ProductManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>(
    blankForm(categories[0]?.id ?? ""),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      [
        product.name,
        product.sku,
        product.brand,
        product.model,
        product.categoryName,
      ]
        .filter(Boolean)
        .some((part) => (part as string).toLowerCase().includes(needle)),
    );
  }, [products, query]);

  const reset = () => {
    setEditingId(null);
    setForm(blankForm(categories[0]?.id ?? ""));
  };

  const startEdit = (product: ProductRow) => {
    setEditingId(product.id);
    setError(null);
    setSuccess(null);
    setForm({
      sku: product.sku,
      name: product.name,
      categoryId: product.categoryId,
      brand: product.brand ?? "",
      model: product.model ?? "",
      capacity: product.capacity ?? "",
      resolution: product.resolution ?? "",
      unit: product.unit,
      hasSerialPort: product.hasSerialPort,
      rs232Protocol: product.rs232Protocol ?? "",
      minStockLevel: String(product.minStockLevel),
      sellingPrice: String(product.sellingPrice),
      description: product.description ?? "",
    });

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    const minStockLevel = Number(form.minStockLevel);
    const sellingPrice = Number(form.sellingPrice);
    if (
      !Number.isFinite(minStockLevel) ||
      minStockLevel < 0 ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0
    ) {
      setError("Minimum stock and selling price must be zero or more.");
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    const result = await sendJson(
      editingId ? `/api/products/${editingId}` : "/api/products",
      editingId ? "PATCH" : "POST",
      { ...form, minStockLevel, sellingPrice },
    );
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(editingId ? "Product updated." : "Product added.");
    reset();
    router.refresh();
  };

  const handleDelete = async (product: ProductRow) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`))
      return;

    setBusy(true);
    setError(null);
    setSuccess(null);
    const result = await sendJson(`/api/products/${product.id}`, "DELETE");
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (editingId === product.id) reset();
    setSuccess("Product deleted.");
    router.refresh();
  };

  if (categories.length === 0) {
    return (
      <Notice tone="info">
        Create a category first, then come back to add products.{" "}
        <Link
          href="/catalog/categories"
          className="font-medium text-red-300 hover:text-red-200"
        >
          Go to categories
        </Link>
      </Notice>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div ref={formRef}>
        <Panel
          title={editingId ? "Edit product" : "Add product"}
          subtitle="SKU must be unique. Prices are in PKR."
          action={
            editingId ? (
              <Button type="button" size="sm" variant="outline" onClick={reset}>
                <X className="h-4 w-4" />
                Cancel edit
              </Button>
            ) : undefined
          }
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap gap-4">
              <Field label="SKU">
                <Input
                  value={form.sku}
                  onChange={(event) => set("sku", event.target.value)}
                  placeholder="e.g. IND-D900S-LCD"
                  required
                />
              </Field>
              <Field label="Product name">
                <Input
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  placeholder="e.g. D-900s LCD Indicator"
                  required
                />
              </Field>
              <Field label="Category">
                <Select
                  value={form.categoryId}
                  onChange={(event) => set("categoryId", event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="flex flex-wrap gap-4">
              <Field label="Brand" hint="Optional">
                <Input
                  value={form.brand}
                  onChange={(event) => set("brand", event.target.value)}
                />
              </Field>
              <Field label="Model" hint="Optional">
                <Input
                  value={form.model}
                  onChange={(event) => set("model", event.target.value)}
                />
              </Field>
              <Field label="Capacity" hint="Optional, e.g. 300kg">
                <Input
                  value={form.capacity}
                  onChange={(event) => set("capacity", event.target.value)}
                />
              </Field>
              <Field label="Resolution" hint="Optional, e.g. 10g">
                <Input
                  value={form.resolution}
                  onChange={(event) => set("resolution", event.target.value)}
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-4">
              <Field label="Unit">
                <Input
                  value={form.unit}
                  onChange={(event) => set("unit", event.target.value)}
                />
              </Field>
              <Field label="Minimum stock" hint="Low-stock alert level">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={form.minStockLevel}
                  onChange={(event) => set("minStockLevel", event.target.value)}
                />
              </Field>
              <Field label="Selling price (PKR)">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={form.sellingPrice}
                  onChange={(event) => set("sellingPrice", event.target.value)}
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              <label className="flex min-w-[200px] flex-1 items-center gap-3 pb-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.hasSerialPort}
                  onChange={(event) =>
                    set("hasSerialPort", event.target.checked)
                  }
                  className="h-4 w-4 accent-red-600"
                />
                Has RS-232 serial port
              </label>
              {form.hasSerialPort && (
                <Field label="RS-232 protocol" hint="e.g. 9600,8,N,1">
                  <Input
                    value={form.rs232Protocol}
                    onChange={(event) =>
                      set("rs232Protocol", event.target.value)
                    }
                  />
                </Field>
              )}
            </div>

            <Field label="Description" hint="Optional">
              <Textarea
                value={form.description}
                onChange={(event) => set("description", event.target.value)}
              />
            </Field>

            {error && <Notice tone="error">{error}</Notice>}
            {success && <Notice tone="success">{success}</Notice>}

            <Button type="submit" size="lg" disabled={busy}>
              <Plus className="h-4 w-4" />
              {busy ? "Saving..." : editingId ? "Save changes" : "Add product"}
            </Button>
          </form>
        </Panel>
      </div>

      <Panel
        title="All products"
        subtitle={`${products.length} total`}
        action={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products"
              className="h-9 w-56 pl-9"
            />
          </div>
        }
      >
        {visible.length === 0 ? (
          <EmptyState
            icon={Package}
            title={products.length === 0 ? "No products yet" : "No matches"}
            description={
              products.length === 0
                ? "Add your first product above."
                : "Try a different search."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Capacity</th>
                  <th className="px-3 py-3 text-right font-medium">
                    Min stock
                  </th>
                  <th className="px-3 py-3 text-right font-medium">Price</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visible.map((product) => (
                  <tr key={product.id} className="align-top">
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-white">
                          {product.name}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {product.sku}
                          {product.brand ? ` · ${product.brand}` : ""}
                          {product.model ? ` ${product.model}` : ""}
                        </span>
                        {product.hasSerialPort && (
                          <span className="pt-1">
                            <Badge variant="cyber">RS-232</Badge>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-zinc-300">
                      {product.categoryName}
                    </td>
                    <td className="px-3 py-3 text-zinc-400">
                      {product.capacity ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-zinc-300">
                      {formatUnits(product.minStockLevel)} {product.unit}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-white">
                      {formatPkr(product.sellingPrice)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => startEdit(product)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        {canDelete && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={busy}
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
