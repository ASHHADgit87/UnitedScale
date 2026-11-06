"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AuthAlert,
  AuthButton,
  AuthCard,
  AuthField,
} from "@/components/auth/AuthUI";

const toSafePath = (value: string | null) =>
  value &&
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !value.startsWith("/\\")
    ? value
    : "/";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = toSafePath(searchParams.get("redirectTo"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign in failed. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Secure access"
      title="Welcome back"
      description="Sign in with your United Scale staff account."
      footer={
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">New to the team?</span>
          <Link
            href="/signup"
            className="font-medium text-red-400 transition-colors hover:text-red-300"
          >
            Request access
          </Link>
        </div>
      }
    >
      {error && <AuthAlert tone="error">{error}</AuthAlert>}

      <form onSubmit={handleLogin} className="flex flex-col gap-5">
        <AuthField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@unitedscale.pk"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<Mail className="h-4 w-4" />}
        />

        <AuthField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          icon={<Lock className="h-4 w-4" />}
          trailing={
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
        />

        <AuthButton type="submit" loading={loading} loadingText="Signing in...">
          Sign in
        </AuthButton>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-xs text-zinc-500">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
