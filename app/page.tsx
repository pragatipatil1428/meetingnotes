"use client";

import { APP_NAME } from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface-secondary)] px-6">
      <div className="animate-fadeInUp text-center">
        <h1 className="font-display text-5xl font-bold text-[var(--color-text-primary)]">
          ✦ {APP_NAME}
        </h1>
        <p className="mt-3 text-lg text-[var(--color-text-secondary)]">
          Turn conversations into momentum.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { emoji: "📝", label: "Meeting Notes" },
            { emoji: "✅", label: "Task Management" },
            { emoji: "🤖", label: "AI Insights" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="mb-2 text-3xl">{item.emoji}</div>
              <h3 className="font-display text-sm font-semibold text-[var(--color-text-primary)]">
                {item.label}
              </h3>
            </div>
          ))}
        </div>

        <p className="mt-12 text-sm text-[var(--color-text-muted)]">
          Foundation ready — Modules coming next.
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
    </main>
  );
}
