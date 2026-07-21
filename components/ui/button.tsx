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
          "ui-button inline-flex items-center gap-1.5 whitespace-nowrap",
          variant,
          size,
          fullWidth && "full",
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <span className="spinner" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
