"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);

    // Simulate sending reset email
    await new Promise((r) => setTimeout(r, 1000));

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-brand-50)] to-white px-4 dark:from-[var(--color-surface-tertiary)] dark:to-[var(--color-surface-secondary)]">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-xl)]">
        <div className="mb-6 text-center">
          <span className="text-3xl text-[var(--color-brand-600)]">✦</span>
          <h1 className="font-display mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
            Reset password
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {sent
              ? "Check your inbox for the reset link."
              : "We&apos;ll send a secure reset link to your email."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] transition-colors placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
                placeholder="you@company.com"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--color-brand-600)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-brand-700)] disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              If an account exists with that email, you&apos;ll receive a reset
              link shortly.
            </p>
            <Link
              href="/login"
              className="text-sm font-semibold text-[var(--color-brand-600)] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
