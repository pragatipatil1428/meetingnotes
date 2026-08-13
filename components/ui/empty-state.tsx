import { type ReactNode } from "react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({
  icon = "📋",
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand-50)] text-2xl shadow-sm dark:bg-[var(--color-brand-900)]/40">
        <span aria-hidden="true">{icon}</span>
      </div>
      <h2 className="font-display mt-4 text-lg font-bold text-[var(--color-text-primary)]">
        {title}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-text-secondary)]">
        {description}
      </p>
      {action && (
        <div className="mt-5">
          <Button onClick={action.onClick} variant="primary" size="md">
            {action.label}
          </Button>
        </div>
      )}
      {children}
    </div>
  );
}
