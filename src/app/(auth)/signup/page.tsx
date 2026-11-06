"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  AuthAlert,
  AuthButton,
  AuthCard,
  AuthField,
} from "@/components/auth/AuthUI";

const MIN_PASSWORD_LENGTH = 10;

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`,
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            phone: phone.trim() || null,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.replace("/pending");
        router.refresh();
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthCard
        eyebrow="Request received"
        title="Check your inbox"
        description="If this email can be registered, a verification link is on its way. After you verify it, an administrator will review your request and assign your role."
      >
        <Link href="/login" className="block">
          <AuthButton type="button">Back to sign in</AuthButton>
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Staff onboarding"
      title="Request access"
      description="Create your account. An administrator approves it and assigns your role."
      footer={
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Already approved?</span>
          <Link
            href="/login"
            className="font-medium text-red-400 transition-colors hover:text-red-300"
          >
            Sign in
          </Link>
        </div>
      }
    >
      {error && <AuthAlert tone="error">{error}</AuthAlert>}

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <AuthField
          label="Full name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="e.g. Muhammad Ali"
          value={name}
          onChange={(event) => setName(event.target.value)}
          icon={<User className="h-4 w-4" />}
        />

        <AuthField
          label="Work email"
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
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+92 300 1234567"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          icon={<Phone className="h-4 w-4" />}
        />

        <AuthField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
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

        <AuthField
          label="Confirm password"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          icon={<Lock className="h-4 w-4" />}
        />

        <AuthAlert tone="info">
          Your role is assigned by an administrator after approval. It cannot be
          chosen here.
        </AuthAlert>

        <AuthButton type="submit" loading={loading} loadingText="Submitting...">
          Submit request
        </AuthButton>
      </form>
    </AuthCard>
  );
}
