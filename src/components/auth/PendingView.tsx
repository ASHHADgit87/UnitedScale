"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LogOut, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthAlert, AuthButton, AuthCard } from "@/components/auth/AuthUI";

type PendingState = "pending" | "suspended" | "error";

interface PendingViewProps {
  state: PendingState;
  email: string | null;
}

const STEPS = [
  { label: "Email verified", done: true, current: false },
  { label: "Administrator review", done: false, current: true },
  { label: "Access granted", done: false, current: false },
];

const COPY: Record<
  PendingState,
  { eyebrow: string; title: string; description: string }
> = {
  pending: {
    eyebrow: "Account status",
    title: "Awaiting approval",
    description:
      "Your email is verified. An administrator must approve your account and assign your role before you can enter.",
  },
  suspended: {
    eyebrow: "Account status",
    title: "Access suspended",
    description:
      "Your access has been suspended. Please contact your administrator.",
  },
  error: {
    eyebrow: "Account status",
    title: "Profile unavailable",
    description:
      "We could not load your profile. Sign out and try again, or contact your administrator.",
  },
};

export default function PendingView({ state, email }: PendingViewProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const copy = COPY[state];

  const handleRefresh = () => {
    setChecking(true);
    router.refresh();
    setTimeout(() => setChecking(false), 1200);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await createClient().auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <AuthCard
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
    >
      {email && <AuthAlert tone="info">Signed in as {email}</AuthAlert>}

      {state === "pending" && (
        <div className="flex flex-col">
          {STEPS.map((step, index) => (
            <div key={step.label} className="flex items-stretch gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border text-xs ${
                    step.done
                      ? "border-red-500 bg-red-500 text-white"
                      : step.current
                        ? "animate-pulse border-red-400 text-red-300 shadow-[0_0_14px_rgba(239,68,68,0.6)]"
                        : "border-white/15 text-zinc-600"
                  }`}
                >
                  {step.done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                {index < STEPS.length - 1 && (
                  <span className="my-1 w-px flex-1 bg-white/10" />
                )}
              </div>
              <span
                className={`pb-5 pt-1 text-sm ${
                  step.done || step.current ? "text-white" : "text-zinc-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {state === "pending" && (
          <AuthButton
            type="button"
            onClick={handleRefresh}
            loading={checking}
            loadingText="Checking..."
          >
            <RefreshCw className="h-4 w-4" />
            Check again
          </AuthButton>
        )}
        <AuthButton
          type="button"
          tone="quiet"
          onClick={handleSignOut}
          loading={signingOut}
          loadingText="Signing out..."
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </AuthButton>
      </div>
    </AuthCard>
  );
}
