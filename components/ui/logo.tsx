import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

/**
 * App logo — mirrors the favicon (app/icon.svg): a slate gradient
 * rounded-square chip with a white chat-bubble and note lines.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5e7a94" />
          <stop offset="55%" stopColor="#475f78" />
          <stop offset="100%" stopColor="#2d3d4f" />
        </linearGradient>
      </defs>

      {/* Rounded-square background */}
      <rect width="64" height="64" rx="14" fill="url(#logo-brand)" />

      {/* Chat bubble */}
      <path
        d="M24 17h20a7 7 0 0 1 7 7v16a7 7 0 0 1-7 7H29l-8 8v-8h-1a7 7 0 0 1-7-7V24a7 7 0 0 1 7-7z"
        fill="#ffffff"
      />

      {/* Note lines */}
      <rect x="24" y="25" width="20" height="3.5" rx="1.75" fill="url(#logo-brand)" />
      <rect x="24" y="32" width="13" height="3.5" rx="1.75" fill="url(#logo-brand)" />
      <rect x="24" y="39" width="17" height="3.5" rx="1.75" fill="url(#logo-brand)" />
    </svg>
  );
}
