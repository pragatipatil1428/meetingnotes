"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AuthCard } from "@/components/auth/auth-card";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-brand-50)] to-white px-4 dark:from-[var(--color-surface-tertiary)] dark:to-[var(--color-surface-secondary)]">
      <AuthCard
        title="Reset password"
        subtitle={
          sent
            ? "Check your inbox for the reset link."
            : "We&apos;ll send a secure reset link to your email."
        }
      >
        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="fp-email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]"
              >
                Email
              </label>
              <input
                id="fp-email"
                type="email"
                {...register("email")}
                className={cn(
                  "w-full rounded-lg border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2",
                  errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border-[var(--color-border-input)] focus:border-[var(--color-brand-600)] focus:ring-[var(--color-brand-200)]"
                )}
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-600)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isLoading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              If an account exists with that email, you&apos;ll receive a reset link shortly.
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-[var(--color-text-secondary)]">
          <Link
            href="/login"
            className="font-medium text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
