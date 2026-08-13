import { cx } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "heading" | "card" | "avatar" | "custom";
  width?: string;
  height?: string;
  count?: number;
}

const variantClasses: Record<string, string> = {
  text: "h-3.5 rounded-md",
  heading: "h-5 rounded-md",
  card: "h-32 rounded-xl",
  avatar: "h-10 w-10 rounded-full",
  custom: "rounded-md",
};

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const style = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cx(
        "animate-pulse bg-[var(--color-surface-tertiary)]",
        variantClasses[variant],
        className
      )}
      style={style}
      aria-hidden="true"
    />
  ));

  return <>{items}</>;
}

/* ── Skeleton Table / List ─────────────────────────── */

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading content" className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      role="status"
      aria-label="Loading card"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <Skeleton variant="heading" width="50%" />
      <div className="mt-3 space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
