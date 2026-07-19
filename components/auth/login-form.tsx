"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div>
        <label
          htmlFor="login-email"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          {...register("email")}
          className={cn(
            "w-full rounded-lg border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2",
            errors.email
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-[var(--color-border-input)] focus:border-[var(--color-brand-600)] focus:ring-[var(--color-brand-200)]"
          )}
          placeholder="you@company.com"
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="login-password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          {...register("password")}
          className={cn(
            "w-full rounded-lg border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2",
            errors.password
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-[var(--color-border-input)] focus:border-[var(--color-brand-600)] focus:ring-[var(--color-brand-200)]"
          )}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-600)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
        {isLoading ? "Signing in…" : "Sign in"}
      </button>

      {/* Links */}
      <div className="flex items-center justify-between text-xs">
        <Link
          href="/forgot-password"
          className="font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] hover:underline"
        >
          Forgot password?
        </Link>
        <Link
          href="/register"
          className="font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] hover:underline"
        >
          Create account
        </Link>
      </div>
    </form>
  );
}


