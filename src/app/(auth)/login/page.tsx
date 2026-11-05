"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950/85 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_10px_rgba(220,38,38,0.8)]" />

      <CardHeader className="space-y-1.5 p-6 sm:p-8 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-100">
          Sign In
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Enter your credentials to access the management system.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-0 space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-950/60 border border-red-800/80 text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <Input
                type="email"
                required
                placeholder="name@unitedscale.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 bg-zinc-900/80 border-zinc-800 focus:border-red-600 focus:ring-red-600 text-zinc-100 placeholder:text-zinc-600 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
              <Input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 bg-zinc-900/80 border-zinc-800 focus:border-red-600 focus:ring-red-600 text-zinc-100 placeholder:text-zinc-600 text-xs"
              />
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="p-6 sm:p-8 pt-0 border-t border-zinc-850/80 bg-zinc-950/60 flex items-center justify-between text-xs">
        <span className="text-zinc-500">Don&apos;t have an account?</span>
        <Link
          href="/signup"
          className="text-red-400 hover:text-red-300 font-medium transition-colors"
        >
          Sign Up →
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full p-8 rounded-lg border border-zinc-800 bg-zinc-950/80 text-center text-xs text-zinc-500">
          Loading portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
