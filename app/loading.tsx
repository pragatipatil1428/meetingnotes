export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-secondary)]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-brand-600)]"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
      </div>
    </div>
  );
}
