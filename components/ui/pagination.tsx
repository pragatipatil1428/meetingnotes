"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const PAGE_SIZE_OPTIONS = [10, 50, 100, 500, 1000];

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/** Build a compact list of page numbers, collapsing long ranges with ellipses. */
function getPageNumbers(current: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, 2, totalPages - 1, totalPages]);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages);
  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  const handlePageSize = (size: number) => {
    onPageSizeChange(size);
    onPageChange(1);
  };

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border-light)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Showing X-Y of Z */}
      <p className="text-xs text-[var(--color-text-secondary)]">
        Showing{" "}
        <span className="font-medium text-[var(--color-text-primary)]">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-[var(--color-text-primary)]">
          {total}
        </span>
      </p>

      <div className="flex items-center gap-3">
        {/* Page size selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--color-text-light)]">
            Rows per page
          </span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSize(Number(e.target.value))}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-brand-600)] focus:outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(current - 1)}
            disabled={current <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border-light)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers(current, totalPages).map((p, i) =>
            p === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-7 w-6 items-center justify-center text-xs text-[var(--color-text-light)]"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  "flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-xs font-medium transition-colors",
                  p === current
                    ? "bg-[var(--color-brand-600)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border-light)]"
                )}
                aria-current={p === current ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(current + 1)}
            disabled={current >= totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-border-light)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
