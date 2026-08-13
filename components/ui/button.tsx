"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/utils";
import type { ButtonVariant, ButtonSize } from "@/lib/types";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-brand-600)] text-white shadow-sm hover:bg-[var(--color-brand-700)]",
  secondary:
    "border border-[var(--color-border-input)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-brand-300)] hover:bg-[var(--color-surface-tertiary)]",
  ghost:
    "text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)] hover:text-[var(--color-text-primary)]",
  danger: "bg-[var(--color-danger)] text-white shadow-sm hover:bg-red-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cx(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-300)] disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span
            className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
