import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-brand-50)] to-white px-4 dark:from-[var(--color-surface-tertiary)] dark:to-[var(--color-surface-secondary)]">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-xl)]">
        <span className="text-4xl text-[var(--color-brand-600)]">✉️</span>
        <h1 className="font-display mt-3 text-2xl font-bold text-[var(--color-text-primary)]">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          We&apos;ve sent a verification link to your inbox. Please check your
          email and click the link to activate your account.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-[var(--color-brand-600)] hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
