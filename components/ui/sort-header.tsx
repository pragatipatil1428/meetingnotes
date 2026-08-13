"use client";

import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

interface SortHeaderProps {
  label: string;
  sortKey: string;
  sort: SortState;
  onSort: (key: string) => void;
  className?: string;
}

export function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: SortHeaderProps) {
  const isActive = sort.key === sortKey;
  const Icon = isActive
    ? sort.direction === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th className={cn("px-4 py-3", className)}>
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-[var(--color-text-primary)]"
        title={`Sort by ${label}`}
      >
        {label}
        <Icon
          className={cn(
            "h-3 w-3",
            isActive
              ? "text-[var(--color-brand-600)]"
              : "text-[var(--color-text-light)] opacity-60"
          )}
        />
      </button>
    </th>
  );
}
