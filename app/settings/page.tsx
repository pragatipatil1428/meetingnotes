"use client";

import { Shell } from "@/components/layout/shell";
import { SettingsForm } from "@/components/settings/settings-form";
import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SettingsForm />
        </motion.div>
      </div>
    </Shell>
  );
}
