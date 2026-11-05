"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"TECHNICIAN" | "MANAGER" | "ADMIN">("TECHNICIAN");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role,
            phone: phone.trim() || null,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supabaseId: data.user.id,
            email: email.trim(),
            name: name.trim(),
            role,
            phone: phone.trim() || null,
          }),
        });

        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setSuccessNotice(
            "Account created successfully. Please verify your email or proceed to sign in."
          );
          setLoading(false);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950/85 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_10px_rgba(220,38,38,0.8)]" />

      <CardHeader className="space-y-1.5 p-6 sm:p-8 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-100">
          Create Account
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Register authorized access for United Scale staff.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 pt-0 space-y-4">
        {error && (
          <div className="p-3 rounded-md bg-red-950/60 border border-red-800/80 text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {successNotice ? (
          <div className="p-4 rounded-md bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Registration Complete</span>
            </div>
            <p className="leading-relaxed text-zinc-400">{successNotice}</p>
            <Link href="/login" className="block pt-1">
              <Button className="w-full bg-red-600 hover:bg-red-500 text-white text-xs">
                Proceed to Sign In →
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <Input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 bg-zinc-900/80 border-zinc-800 focus:border-red-600 focus:ring-red-600 text-zinc-100 placeholder:text-zinc-600 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Official Email
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
                Facility Access Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: "TECHNICIAN", label: "Technician" },
                    { key: "MANAGER", label: "Manager" },
                    { key: "ADMIN", label: "Admin" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setRole(key)}
                    className={`py-2 px-3 rounded text-xs font-medium transition-all text-center border ${
                      role === key
                        ? "bg-red-950/80 border-red-600 text-red-200 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Phone Contact (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <Input
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9 bg-zinc-900/80 border-zinc-800 focus:border-red-600 focus:ring-red-600 text-zinc-100 placeholder:text-zinc-600 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Password (Min 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
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
              className="w-full py-5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="p-6 sm:p-8 pt-0 border-t border-zinc-850/80 bg-zinc-950/60 flex items-center justify-between text-xs">
        <span className="text-zinc-500">Already have an account?</span>
        <Link
          href="/login"
          className="text-red-400 hover:text-red-300 font-medium transition-colors"
        >
          Sign In →
        </Link>
      </CardFooter>
    </Card>
  );
}