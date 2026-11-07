"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Warehouse, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input, Select } from "@/components/ui/input";
import { EmptyState, Notice, Panel } from "@/components/layout/PageKit";
import { sendJson } from "@/lib/master-client";

export interface LocationRow {
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  isHeadquarters: boolean;
  managerId: string | null;
  managerName: string | null;
  batchCount: number;
}

interface LocationManagerProps {
  locations: LocationRow[];
  managers: { id: string; name: string }[];
  canDelete: boolean;
}

const BLANK = {
  name: "",
  code: "",
  location: "",
  city: "Karachi",
  managerId: "",
  isHeadquarters: false,
};

export default function LocationManager({
  locations,
  managers,
  canDelete,
}: LocationManagerProps) {
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

  const startEdit = (location: LocationRow) => {
    setEditingId(location.id);
    setError(null);
    setSuccess(null);
    setForm({
      name: location.name,
      code: location.code,
      location: location.location,
      city: location.city,
      managerId: location.managerId ?? "",
      isHeadquarters: location.isHeadquarters,
    });

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);
    setSuccess(null);

    const result = await sendJson(
      editingId ? `/api/warehouses/${editingId}` : "/api/warehouses",
      editingId ? "PATCH" : "POST",
      { ...form, managerId: form.managerId || null },
    );
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(editingId ? "Location updated." : "Location added.");
    reset();
    router.refresh();
  };

  const handleDelete = async (location: LocationRow) => {
    if (!window.confirm(`Delete "${location.name}"? This cannot be undone.`))
      return;

    setBusy(true);
    setError(null);
    setSuccess(null);
    const result = await sendJson(`/api/warehouses/${location.id}`, "DELETE");
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (editingId === location.id) reset();
    setSuccess("Location deleted.");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <div ref={formRef}>
        <Panel
          title={editingId ? "Edit location" : "Add location"}
          subtitle="Only one location can be the headquarters."
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
                  placeholder="e.g. Gulshan Godown"
                  required
                />
              </Field>
              <Field label="Code" hint="Must be unique">
                <Input
                  value={form.code}
                  onChange={(event) =>
                    setForm({ ...form, code: event.target.value })
                  }
                  placeholder="WH-GULSHAN"
                  required
                />
              </Field>
              <Field label="City">
                <Input
                  value={form.city}
                  onChange={(event) =>
                    setForm({ ...form, city: event.target.value })
                  }
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-4">
              <Field label="Address">
                <Input
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                  placeholder="Street, block, area"
                  required
                />
              </Field>
              <Field label="Manager" hint="Optional">
                <Select
                  value={form.managerId}
                  onChange={(event) =>
                    setForm({ ...form, managerId: event.target.value })
                  }
                >
                  <option value="">No manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <label className="flex items-center gap-3 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.isHeadquarters}
                onChange={(event) =>
                  setForm({ ...form, isHeadquarters: event.target.checked })
                }
                className="h-4 w-4 accent-red-600"
              />
              This is the headquarters
            </label>

            {error && <Notice tone="error">{error}</Notice>}
            {success && <Notice tone="success">{success}</Notice>}

            <Button type="submit" size="lg" disabled={busy}>
              <Plus className="h-4 w-4" />
              {busy ? "Saving..." : editingId ? "Save changes" : "Add location"}
            </Button>
          </form>
        </Panel>
      </div>

      <Panel title="All locations" subtitle={`${locations.length} total`}>
        {locations.length === 0 ? (
          <EmptyState
            icon={Warehouse}
            title="No locations yet"
            description="Add your first warehouse or office above."
          />
        ) : (
          <div className="flex flex-col divide-y divide-white/10">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {location.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({location.code})
                    </span>
                    {location.isHeadquarters && (
                      <Badge variant="cyber">HQ</Badge>
                    )}
                  </div>
                  <span className="truncate text-xs text-zinc-500">
                    {location.location}, {location.city}
                  </span>
                  <span className="text-[11px] text-zinc-600">
                    Manager: {location.managerName ?? "None"} ·{" "}
                    {location.batchCount}{" "}
                    {location.batchCount === 1
                      ? "stock batch"
                      : "stock batches"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => startEdit(location)}
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
                      onClick={() => handleDelete(location)}
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
