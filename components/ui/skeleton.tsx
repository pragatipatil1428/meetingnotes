import { cx } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "heading" | "card" | "avatar" | "custom";
  width?: string;
  height?: string;
  count?: number;
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClass = `skeleton skeleton-${variant}`;

  const style = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cx(baseClass, className)}
      style={style}
      aria-hidden="true"
    />
  ));

  return <>{items}</>;
}

/* ── Skeleton Table / List ─────────────────────────── */

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading content">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", alignItems: "center" }}>
          <Skeleton variant="avatar" />
          <div style={{ flex: 1 }}>
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
    <div className="ui-card" role="status" aria-label="Loading card">
      <Skeleton variant="heading" />
      <Skeleton variant="text" count={3} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
