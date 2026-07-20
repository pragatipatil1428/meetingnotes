"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Shell } from "@/components/layout/shell";
import { SkeletonCard } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield, Fingerprint, Sparkles } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email[0].toUpperCase();
}

export default function ProfilePage() {
  const { data: user, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["settings"],
    queryFn: () => api("/api/settings"),
  });

  if (isLoading) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <SkeletonCard />
        </div>
      </Shell>
    );
  }

  if (error || !user) {
    return (
      <Shell>
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">Failed to load profile</p>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
              Profile
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Your personal profile and account information
            </p>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
          >
            {/* Cover */}
            <div className="h-24 bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-700)]" />

            {/* Avatar & Name */}
            <div className="px-6 pb-6">
              <div className="-mt-12 mb-4 flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-[var(--color-brand-600)] text-2xl font-bold text-white shadow-lg ring-4 ring-[var(--color-surface)]">
                  {getInitials(user.name, user.email)}
                </div>
                <div className="pb-1">
                  <h2 className="font-display text-xl font-bold text-[var(--color-text-primary)]">
                    {user.name || "Unnamed User"}
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg bg-[var(--color-surface-tertiary)] px-4 py-3">
                  <Mail className="h-4 w-4 text-[var(--color-brand-500)] shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-light)]">
                      Email
                    </p>
                    <p className="text-sm text-[var(--color-text-primary)]">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-[var(--color-surface-tertiary)] px-4 py-3">
                  <Shield className="h-4 w-4 text-[var(--color-brand-500)] shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-light)]">
                      Email Verified
                    </p>
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {user.emailVerified ? (
                        <span className="text-green-600 dark:text-green-400">Verified</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">Not verified</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-[var(--color-surface-tertiary)] px-4 py-3">
                  <Calendar className="h-4 w-4 text-[var(--color-brand-500)] shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-light)]">
                      Member Since
                    </p>
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-[var(--color-surface-tertiary)] px-4 py-3">
                  <Fingerprint className="h-4 w-4 text-[var(--color-brand-500)] shrink-0" />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-light)]">
                      User ID
                    </p>
                    <p className="text-sm font-mono text-[var(--color-text-primary)]">
                      {user.id.slice(0, 12)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <h3 className="mb-4 font-display text-base font-bold text-[var(--color-text-primary)]">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-lg bg-[var(--color-brand-600)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-700)]"
              >
                <Sparkles className="h-4 w-4" />
                Manage Settings
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Shell>
  );
}
