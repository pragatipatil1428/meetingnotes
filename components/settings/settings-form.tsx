"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useThemeStore } from "@/stores/theme-store";
import { Sun, Moon, User, Lock, Mail, Save, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface UserSettings {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
}

export function SettingsForm() {
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const { mode, toggle: toggleTheme } = useThemeStore();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<UserSettings>({
    queryKey: ["settings"],
    queryFn: () => {
      return api("/api/settings").then((res: any) => {
        const settings = res.data || res;
        setName(settings.name || "");
        return settings;
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api("/api/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setProfileSuccess(true);
      setProfileError("");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (err: Error) => setProfileError(err.message),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api("/api/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (err: Error) => setPasswordError(err.message),
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    if (!name.trim()) {
      setProfileError("Name is required");
      return;
    }
    updateProfileMutation.mutate({ name: name.trim() });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    updatePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load settings</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["settings"] })}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <User className="h-4 w-4 text-[var(--color-brand-500)]" />
            <h2 className="font-display text-base font-bold text-[var(--color-text-primary)]">Profile</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {profileError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
                Profile updated successfully!
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                Display Name
              </label>
              <input
                id="display-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                Email
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface-tertiary)] px-3 py-2">
                <Mail className="h-4 w-4 text-[var(--color-text-light)]" />
                <span className="text-sm text-[var(--color-text-muted)]">{user?.email}</span>
              </div>
            </div>

            <Button type="submit" loading={updateProfileMutation.isPending}>
              <Save className="mr-1.5 h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </motion.div>

        {/* Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Lock className="h-4 w-4 text-[var(--color-brand-500)]" />
            <h2 className="font-display text-base font-bold text-[var(--color-text-primary)]">Password</h2>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {passwordError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
                Password updated successfully!
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
              />
            </div>

            <Button type="submit" loading={updatePasswordMutation.isPending}>
              <Save className="mr-1.5 h-4 w-4" />
              Update Password
            </Button>
          </form>
        </motion.div>

        {/* Theme Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="h-4 w-4 text-[var(--color-brand-500)]" />
            <h2 className="font-display text-base font-bold text-[var(--color-text-primary)]">Appearance</h2>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[var(--color-border-light)] p-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Theme</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {mode === "light" ? "Light mode" : "Dark mode"}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface-secondary)] px-4 py-2 text-sm text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-brand-300)]"
            >
              {mode === "light" ? (
                <>
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  Light Mode
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Mail className="h-4 w-4 text-[var(--color-brand-500)]" />
            <h2 className="font-display text-base font-bold text-[var(--color-text-primary)]">Account</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-[var(--color-surface-tertiary)] px-4 py-3">
              <span className="text-sm text-[var(--color-text-secondary)]">Email verified</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {user?.emailVerified ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--color-surface-tertiary)] px-4 py-3">
              <span className="text-sm text-[var(--color-text-secondary)]">Member since</span>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
