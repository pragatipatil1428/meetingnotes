"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-brand-50)] to-white px-4 dark:from-[var(--color-surface-tertiary)] dark:to-[var(--color-surface-secondary)]">
      <AuthCard
        title="Create your account"
        subtitle="Start turning conversations into momentum."
      >
        <RegisterForm />
      </AuthCard>
    </div>
  );
}
