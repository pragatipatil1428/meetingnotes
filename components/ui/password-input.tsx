"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Shows red border/focus ring when the field has a validation error. */
  error?: boolean;
}

/**
 * Password input with an eye toggle to reveal/hide the entered value.
 *
 * Accepts any normal input props — including the spread result of
 * react-hook-form's `register()` (name/onChange/onBlur/ref).
 */
export function PasswordInput({ className, error = false, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className={cn(
          "w-full rounded-lg border bg-[var(--color-surface)] py-2.5 pl-3.5 pr-10 text-sm text-[var(--color-text-primary)] transition-all placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-[var(--color-border-input)] focus:border-[var(--color-brand-600)] focus:ring-[var(--color-brand-200)]",
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        // Keep focus in the input (and the mobile keyboard up) when toggling.
        onMouseDown={(e) => e.preventDefault()}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        aria-controls={props.id}
        title={show ? "Hide password" : "Show password"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--color-text-light)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-300)]"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
