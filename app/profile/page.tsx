"use client";

import { Shell } from "@/components/layout/shell";
import { SettingsForm } from "@/components/settings/settings-form";
import { motion } from "framer-motion";

export default function ProfilePage() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
              Profile
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              View and manage your personal profile information
            </p>
          </div>
          <SettingsForm />
        </motion.div>
      </div>
    </Shell>
  );
}
