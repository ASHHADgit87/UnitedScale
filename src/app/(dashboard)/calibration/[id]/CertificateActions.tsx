"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Pencil, Send, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Notice } from "@/components/layout/PageKit";

interface CertificateActionsProps {
  id: string;
  status: "DRAFT" | "PENDING_INSPECTION" | "APPROVED_GOVT_SINDH" | "REJECTED";
  canEdit: boolean;
  canApprove: boolean;
}

export default function CertificateActions({
  id,
  status,
  canEdit,
  canApprove,
}: CertificateActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"idle" | "approve" | "reject">("idle");
  const [verificationNo, setVerificationNo] = useState("");
  const [reason, setReason] = useState("");

  const send = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/calibration/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok || !json?.success) {
        setError(json?.message ?? "The action could not be completed.");
        return;
      }
      setMode("idle");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const editable = (status === "DRAFT" || status === "REJECTED") && canEdit;
  const reviewable = status === "PENDING_INSPECTION" && canApprove;

  if (!editable && !reviewable) {
    return (
      <p className="p-5 text-xs text-zinc-500">
        {status === "APPROVED_GOVT_SINDH"
          ? "This certificate is approved and locked."
          : status === "PENDING_INSPECTION"
            ? "This certificate is waiting for a manager or administrator to review it."
            : "You do not have permission to change this certificate."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      {editable && (
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/calibration/${id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <Button disabled={busy} onClick={() => send({ action: "submit" })}>
            <Send className="h-4 w-4" />
            Submit for approval
          </Button>
        </div>
      )}

      {reviewable && mode === "idle" && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setMode("approve")}>
            <Check className="h-4 w-4" />
            Approve
          </Button>
          <Button variant="destructive" onClick={() => setMode("reject")}>
            <X className="h-4 w-4" />
            Reject
          </Button>
        </div>
      )}

      {reviewable && mode === "approve" && (
        <div className="flex flex-col gap-3">
          <Field label="Govt. of Sindh verification number">
            <Input
              value={verificationNo}
              onChange={(event) => setVerificationNo(event.target.value)}
              placeholder="e.g. SINDH-WM-KHI-2026-4421"
            />
          </Field>
          <div className="flex gap-3">
            <Button
              disabled={busy || !verificationNo.trim()}
              onClick={() => send({ action: "approve", verificationNo })}
            >
              Confirm approval
            </Button>
            <Button variant="ghost" onClick={() => setMode("idle")}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {reviewable && mode === "reject" && (
        <div className="flex flex-col gap-3">
          <Field label="Reason for rejecting">
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              disabled={busy || !reason.trim()}
              onClick={() => send({ action: "reject", reason })}
            >
              Confirm rejection
            </Button>
            <Button variant="ghost" onClick={() => setMode("idle")}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}
