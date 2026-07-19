"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-brand-50)] to-white px-4 dark:from-[var(--color-surface-tertiary)] dark:to-[var(--color-surface-secondary)]">
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your Minutely workspace."
      >
        {registered && (
          <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            Account created successfully! Please sign in.
          </div>
        )}
        <LoginForm />
      </AuthCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
