"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { EmptyState, Notice, Panel } from "@/components/layout/PageKit";
import { sendJson } from "@/lib/master-client";

export interface CategoryRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  productCount: number;
}

interface CategoryManagerProps {
  categories: CategoryRow[];
  canDelete: boolean;
}

const BLANK = { name: "", code: "", description: "" };

export default function CategoryManager({
  categories,
  canDelete,
}: CategoryManagerProps) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setEditingId(null);
    setForm(BLANK);
  };

  const startEdit = (category: CategoryRow) => {
    setEditingId(category.id);
    setError(null);
    setSuccess(null);
    setForm({
      name: category.name,
      code: category.code,
      description: category.description ?? "",
    });
    // Why a ref: the dashboard scrolls inside <main>, not the window.
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    setSuccess(null);

    const result = await sendJson(
      editingId ? `/api/categories/${editingId}` : "/api/categories",
      editingId ? "PATCH" : "POST",
      form,
    );
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(editingId ? "Category updated." : "Category added.");
    reset();
    router.refresh();
  };

  const handleDelete = async (category: CategoryRow) => {
    if (!window.confirm(`Delete "${category.name}"? This cannot be undone.`))
      return;

    setBusy(true);
    setError(null);
    setSuccess(null);
    const result = await sendJson(`/api/categories/${category.id}`, "DELETE");
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (editingId === category.id) reset();
    setSuccess("Category deleted.");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div ref={formRef}>
        <Panel
          title={editingId ? "Edit category" : "Add category"}
          subtitle="Name and code must both be unique."
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
              <Field label="Name">
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Load Cells"
                  required
                />
              </Field>
              <Field label="Code" hint="Short, e.g. LC">
                <Input
                  value={form.code}
                  onChange={(event) =>
                    setForm({ ...form, code: event.target.value })
                  }
                  placeholder="LC"
                  required
                />
              </Field>
            </div>

            <Field label="Description" hint="Optional">
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </Field>

            {error && <Notice tone="error">{error}</Notice>}
            {success && <Notice tone="success">{success}</Notice>}

            <Button type="submit" size="lg" disabled={busy}>
              <Plus className="h-4 w-4" />
              {busy ? "Saving..." : editingId ? "Save changes" : "Add category"}
            </Button>
          </form>
        </Panel>
      </div>

      <Panel title="All categories" subtitle={`${categories.length} total`}>
        {categories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No categories yet"
            description="Add your first category above."
          />
        ) : (
          <div className="flex flex-col divide-y divide-white/10">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium text-white">
                    {category.name}{" "}
                    <span className="text-xs font-normal text-zinc-500">
                      ({category.code})
                    </span>
                  </span>
                  <span className="text-xs text-zinc-500">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "product" : "products"}
                    {category.description ? ` · ${category.description}` : ""}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => startEdit(category)}
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
                      onClick={() => handleDelete(category)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
