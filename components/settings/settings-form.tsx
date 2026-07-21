"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useThemeStore } from "@/stores/theme-store";
import {
  Sun,
  Moon,
  User,
  Lock,
  Mail,
  Save,
  Shield,
  Calendar,
  Fingerprint,
  Palette,
  Eye,
  Check,
  Clock,
} from "lucide-react";
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

type SettingsTab = "profile" | "security" | "appearance" | "account";

const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "account", label: "Account", icon: Shield },
];

export function SettingsForm() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
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
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
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
      {/* ── Profile Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        {/* Gradient Cover */}
        <div className="relative h-32 bg-gradient-to-r from-[var(--color-brand-500)] via-[var(--color-brand-600)] to-[var(--color-brand-700)] sm:h-40">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        </div>

        {/* Avatar & Info */}
        <div className="relative px-6 pb-6">
          <div className="-mt-12 flex items-end gap-5 sm:-mt-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-brand-600)] text-2xl font-bold text-white shadow-lg ring-4 ring-[var(--color-surface)] sm:h-24 sm:w-24 sm:text-3xl">
              {getInitials(user.name, user.email)}
            </div>
            <div className="pb-1">
              <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
                {user.name || "Unnamed User"}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[var(--color-brand-100)] text-[var(--color-brand-700)] shadow-sm dark:bg-[var(--color-brand-900)] dark:text-[var(--color-brand-200)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeTab === "profile" && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-[var(--color-brand-500)]" />
              <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">Edit Profile</h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="max-w-lg space-y-5">
              {profileError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
                >
                  {profileError}
                </motion.div>
              )}
              {profileSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400"
                >
                  Profile updated successfully!
                </motion.div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.5px] text-[var(--color-text-secondary)]">
                  Display Name
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] transition-all focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.5px] text-[var(--color-text-secondary)]">
                  Email Address
                </label>
                <div className="flex items-center gap-2.5 rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface-tertiary)] px-4 py-2.5">
                  <Mail className="h-4 w-4 text-[var(--color-text-light)]" />
                  <span className="text-sm text-[var(--color-text-muted)]">{user.email}</span>
                  <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" loading={updateProfileMutation.isPending}>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Lock className="h-5 w-5 text-[var(--color-brand-500)]" />
              <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordUpdate} className="max-w-lg space-y-5">
              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
                >
                  {passwordError}
                </motion.div>
              )}
              {passwordSuccess && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400"
                >
                  Password updated successfully!
                </motion.div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.5px] text-[var(--color-text-secondary)]">
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] transition-all focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.5px] text-[var(--color-text-secondary)]">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] transition-all focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.5px] text-[var(--color-text-secondary)]">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-[var(--color-border-input)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] transition-all focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-200)]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" loading={updatePasswordMutation.isPending}>
                  <Lock className="mr-1.5 h-4 w-4" />
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Palette className="h-5 w-5 text-[var(--color-brand-500)]" />
              <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">Appearance</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Light Mode Card */}
              <button
                onClick={() => mode !== "light" && toggleTheme()}
                className={`group relative rounded-xl border-2 p-5 text-left transition-all ${
                  mode === "light"
                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-input)]"
                }`}
              >
                {mode === "light" && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-500)]">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <Sun className="h-5 w-5" />
                </div>
                <p className="font-semibold text-[var(--color-text-primary)]">Light</p>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Clean, bright interface</p>
              </button>

              {/* Dark Mode Card */}
              <button
                onClick={() => mode !== "dark" && toggleTheme()}
                className={`group relative rounded-xl border-2 p-5 text-left transition-all ${
                  mode === "dark"
                    ? "border-[var(--color-brand-500)] bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-input)]"
                }`}
              >
                {mode === "dark" && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand-500)]">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Moon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-[var(--color-text-primary)]">Dark</p>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Easy on the eyes</p>
              </button>
            </div>

            <div className="mt-6 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)] p-4">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-[var(--color-text-light)]" />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Currently using <strong className="text-[var(--color-text-secondary)]">{mode === "light" ? "Light" : "Dark"}</strong> mode
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-[var(--color-brand-500)]" />
              <h2 className="font-display text-lg font-bold text-[var(--color-text-primary)]">Account Details</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)] px-4 py-3.5">
                <Mail className="h-4 w-4 text-[var(--color-brand-500)] shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-light)]">Email</p>
                  <p className="text-sm text-[var(--color-text-primary)]">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)] px-4 py-3.5">
                <Shield className="h-4 w-4 text-[var(--color-brand-500)] shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-light)]">Email Verified</p>
                  <p className="text-sm">
                    {user.emailVerified ? (
                      <span className="text-green-600 dark:text-green-400">Verified</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">Not verified</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)] px-4 py-3.5">
                <Calendar className="h-4 w-4 text-[var(--color-brand-500)] shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-light)]">Member Since</p>
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)] px-4 py-3.5">
                <Fingerprint className="h-4 w-4 text-[var(--color-brand-500)] shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-light)]">User ID</p>
                  <p className="text-sm font-mono text-[var(--color-text-primary)]">{user.id.slice(0, 12)}...</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-tertiary)] px-4 py-3.5">
                <Clock className="h-4 w-4 text-[var(--color-brand-500)] shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.5px] text-[var(--color-text-light)]">Last Updated</p>
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {new Date(user.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
