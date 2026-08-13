"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useThemeStore } from "@/stores/theme-store";
import { Sun, Moon, User, Lock, Mail, Save, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface UserSettings {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
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

  if (error || !user) {
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
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand-600)] text-lg font-bold text-white">
            {getInitials(user.name, user.email)}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
              Settings
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {user.name || "User"} &middot; {user.email}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="h-4 w-4 text-[var(--color-brand-500)]" />
          <h2 className="font-display text-base font-bold text-[var(--color-text-primary)]">Profile</h2>
        </div>

        <form onSubmit={handleProfileUpdate} className="max-w-lg space-y-4">
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
              <span className="text-sm text-[var(--color-text-muted)]">{user.email}</span>
            </div>
          </div>

          <Button
            variant="secondary"
            type="submit"
            loading={updateProfileMutation.isPending}
            disabled={name.trim() === (user?.name || "") || !name.trim()}
          >
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

        <form onSubmit={handlePasswordUpdate} className="max-w-lg space-y-4">
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
            <PasswordInput
              id="current-password"
              className="px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                New Password
              </label>
              <PasswordInput
                id="new-password"
                className="px-3 py-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[var(--color-text-secondary)]">
                Confirm New Password
              </label>
              <PasswordInput
                id="confirm-password"
                className="px-3 py-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button
            variant="secondary"
            type="submit"
            loading={updatePasswordMutation.isPending}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            <Lock className="mr-1.5 h-4 w-4" />
            Update Password
          </Button>
        </form>
      </motion.div>

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Sun className="h-4 w-4 text-[var(--color-brand-500)]" />
          <h2 className="font-display text-base font-bold text-[var(--color-text-primary)]">Appearance</h2>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)] px-4 py-3">
          <div className="flex items-center gap-3">
            {mode === "light" ? (
              <Moon className="h-4 w-4 text-[var(--color-text-light)]" />
            ) : (
              <Sun className="h-4 w-4 text-[var(--color-text-light)]" />
            )}
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Theme</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {mode === "light" ? "Light mode" : "Dark mode"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-4 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-brand-300)]"
          >
            Switch to {mode === "light" ? "Dark" : "Light"}
          </button>
        </div>
      </motion.div>

      {/* Account Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield className="h-4 w-4 text-[var(--color-brand-500)]" />
          <h2 className="font-display text-base font-bold text-[var(--color-text-primary)]">Account</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg bg-[var(--color-surface-tertiary)] px-4 py-3">
            <span className="text-sm text-[var(--color-text-secondary)]">Member since</span>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              {user.createdAt
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
  );
}
